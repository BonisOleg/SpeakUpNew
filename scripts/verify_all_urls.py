#!/usr/bin/env python
"""
Скрипт для автоматичної перевірки всіх URL зі старого sitemap.
Перевіряє що всі URL або працюють, або мають правильні 301 редиректи.
"""
import os
import sys
import django
import requests
from urllib.parse import urljoin, urlparse

# Налаштування Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SpeakUp.settings.develop')
django.setup()

from apps.core.redirects import REDIRECTS
from apps.core.models import NewsArticle

# Базовий URL для перевірки
BASE_URL = os.environ.get('VERIFY_BASE_URL', 'http://localhost:8000')

class URLVerifier:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url.rstrip('/')
        self.results = {
            'success': [],
            'redirect_ok': [],
            'redirect_wrong': [],
            'missing_redirect': [],
            'errors': []
        }

    def check_url(self, old_path):
        """Перевіряє один URL."""
        full_url = urljoin(self.base_url, old_path)

        try:
            response = requests.head(full_url, allow_redirects=False, timeout=10)

            # Якщо 200 - все добре
            if response.status_code == 200:
                self.results['success'].append(old_path)
                return True, 'OK'

            # Якщо 301/302 - перевіряємо куди редиректить
            elif response.status_code in [301, 302]:
                redirect_to = response.headers.get('Location', '')

                # Отримуємо шлях з редиректу
                parsed = urlparse(redirect_to)
                redirect_path = parsed.path

                # Перевіряємо чи редирект правильний
                expected = self.get_expected_redirect(old_path)

                if expected and redirect_path == expected:
                    self.results['redirect_ok'].append((old_path, redirect_path))
                    return True, f'Redirect OK -> {redirect_path}'
                elif expected:
                    self.results['redirect_wrong'].append((old_path, redirect_path, expected))
                    return False, f'Redirect WRONG: got {redirect_path}, expected {expected}'
                else:
                    self.results['redirect_ok'].append((old_path, redirect_path))
                    return True, f'Redirect -> {redirect_path} (no expected)'

            # 404 - помилка
            elif response.status_code == 404:
                expected = self.get_expected_redirect(old_path)
                if expected:
                    self.results['missing_redirect'].append((old_path, expected))
                    return False, f'404 - should redirect to {expected}'
                else:
                    self.results['errors'].append((old_path, '404 - not found and no redirect'))
                    return False, '404 - not found'

            else:
                self.results['errors'].append((old_path, f'Status {response.status_code}'))
                return False, f'Status {response.status_code}'

        except requests.exceptions.RequestException as e:
            self.results['errors'].append((old_path, str(e)))
            return False, f'Error: {str(e)}'

    def get_expected_redirect(self, path):
        """Отримує очікуваний редирект для шляху."""
        # Перевірка статичних редиректів
        if path in REDIRECTS:
            return REDIRECTS[path]

        # Перевірка без trailing slash
        path_normalized = path.rstrip('/') if path != '/' else '/'
        if path_normalized in REDIRECTS:
            return REDIRECTS[path_normalized]

        # Перевірка news статей
        if path.startswith('/news/'):
            article = NewsArticle.objects.filter(old_url_uk=path).first()
            if not article:
                article = NewsArticle.objects.filter(old_url_ru=path).first()

            if article:
                from django.urls import reverse
                from django.utils.translation import activate
                activate('uk')  # Перевіряємо UK версію
                return article.get_absolute_url()

        return None

    def verify_all_urls(self, url_list):
        """Перевіряє список URL."""
        total = len(url_list)
        print(f"Перевірка {total} URL...")
        print(f"Base URL: {self.base_url}\n")

        for i, url in enumerate(url_list, 1):
            url = url.strip()
            if not url:
                continue

            ok, message = self.check_url(url)
            status = "✓" if ok else "✗"
            print(f"[{i}/{total}] {status} {url:50} {message}")

        self.print_summary()

    def print_summary(self):
        """Виводить підсумок перевірки."""
        print("\n" + "="*80)
        print("ПІДСУМОК ПЕРЕВІРКИ")
        print("="*80)

        total = (
            len(self.results['success']) +
            len(self.results['redirect_ok']) +
            len(self.results['redirect_wrong']) +
            len(self.results['missing_redirect']) +
            len(self.results['errors'])
        )

        print(f"\nВсього перевірено: {total}")
        print(f"✓ Успішних (200): {len(self.results['success'])}")
        print(f"✓ Редиректів OK (301): {len(self.results['redirect_ok'])}")
        print(f"✗ Редиректів невірних: {len(self.results['redirect_wrong'])}")
        print(f"✗ Відсутніх редиректів: {len(self.results['missing_redirect'])}")
        print(f"✗ Помилок: {len(self.results['errors'])}")

        success_rate = ((len(self.results['success']) + len(self.results['redirect_ok'])) / total * 100) if total > 0 else 0
        print(f"\nУспішність: {success_rate:.1f}%")

        if self.results['redirect_wrong']:
            print("\nНЕВІРНІ РЕДИРЕКТИ:")
            for old, got, expected in self.results['redirect_wrong']:
                print(f"  {old}")
                print(f"    Отримано: {got}")
                print(f"    Очікувалось: {expected}")

        if self.results['missing_redirect']:
            print("\nВІДСУТНІ РЕДИРЕКТИ:")
            for old, expected in self.results['missing_redirect']:
                print(f"  {old} -> має бути {expected}")

        if self.results['errors']:
            print("\nПОМИЛКИ:")
            for url, error in self.results['errors']:
                print(f"  {url}: {error}")

        print("\n" + "="*80)

        if self.results['redirect_wrong'] or self.results['missing_redirect'] or self.results['errors']:
            print("❌ ЗНАЙДЕНО ПРОБЛЕМИ! Потрібно виправити перед міграцією.")
            return False
        else:
            print("✅ ВСІ URL ПРАЦЮЮТЬ КОРЕКТНО!")
            return True


def load_urls_from_file(filepath):
    """Завантажує URL з файлу."""
    with open(filepath, 'r') as f:
        return [line.strip() for line in f if line.strip()]


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Перевірка URL зі старого sitemap')
    parser.add_argument('--url-file', help='Файл з URL (один на рядок)', required=True)
    parser.add_argument('--base-url', default=BASE_URL, help='Базовий URL для перевірки')
    parser.add_argument('--save-results', help='Зберегти результати в файл')

    args = parser.parse_args()

    # Завантажуємо URL
    urls = load_urls_from_file(args.url_file)
    print(f"Завантажено {len(urls)} URL з {args.url_file}")

    # Перевіряємо
    verifier = URLVerifier(args.base_url)
    success = verifier.verify_all_urls(urls)

    # Зберігаємо результати якщо потрібно
    if args.save_results:
        import json
        with open(args.save_results, 'w') as f:
            json.dump(verifier.results, f, indent=2, ensure_ascii=False)
        print(f"\nРезультати збережено в {args.save_results}")

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()




