#!/usr/bin/env python
"""
Скрипт для перевірки чи всі news статті мають old_url_uk/old_url_ru.
Також перевіряє чи всі URL з post-sitemap мають відповідники.
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SpeakUp.settings.develop')
django.setup()

from apps.core.models import NewsArticle

def check_news_old_urls():
    """Перевіряє чи всі статті мають old_url."""
    articles = NewsArticle.objects.all()

    missing_uk = []
    missing_ru = []

    for article in articles:
        if not article.old_url_uk:
            missing_uk.append(article)
        if article.slug_ru and not article.old_url_ru:
            missing_ru.append(article)

    print("="*80)
    print("ПЕРЕВІРКА OLD_URL ДЛЯ NEWS СТАТЕЙ")
    print("="*80)
    print(f"\nВсього статей в базі: {articles.count()}")

    if missing_uk:
        print(f"\n❌ Статей БЕЗ old_url_uk: {len(missing_uk)}")
        for article in missing_uk:
            print(f"  - {article.title_uk} (slug: {article.slug_uk})")
    else:
        print(f"\n✅ Всі статті мають old_url_uk")

    if missing_ru:
        print(f"\n❌ Статей БЕЗ old_url_ru (але з slug_ru): {len(missing_ru)}")
        for article in missing_ru:
            print(f"  - {article.title_ru or article.title_uk} (slug_ru: {article.slug_ru})")
    else:
        print(f"\n✅ Всі статті з RU версією мають old_url_ru")

    print("\n" + "="*80)

    return len(missing_uk) == 0 and len(missing_ru) == 0


def check_sitemap_urls(sitemap_file):
    """Перевіряє чи всі URL з sitemap мають відповідники в базі."""
    import re

    with open(sitemap_file, 'r') as f:
        content = f.read()

    # Знаходимо всі URL
    urls = re.findall(r'<loc>https://speak-up\.com\.ua([^<]+)</loc>', content)

    print("\n" + "="*80)
    print(f"ПЕРЕВІРКА URL З POST-SITEMAP ({len(urls)} URL)")
    print("="*80)

    not_found = []
    found = []

    for url in urls:
        url_normalized = url.rstrip('/')

        # Перевіряємо чи це news стаття
        if '/news/' in url or '/bez-kategoriї/' in url:
            # Шукаємо в базі
            article = NewsArticle.objects.filter(old_url_uk=url_normalized).first()
            if not article:
                article = NewsArticle.objects.filter(old_url_ru=url_normalized).first()

            if article:
                found.append(url)
            else:
                not_found.append(url)
        else:
            found.append(url)  # Не news URL - пропускаємо

    print(f"\n✅ Знайдено відповідників: {len(found)}")

    if not_found:
        print(f"\n❌ БЕЗ відповідників: {len(not_found)}")
        print("\nПерші 20:")
        for url in not_found[:20]:
            print(f"  - {url}")
        if len(not_found) > 20:
            print(f"  ... і ще {len(not_found) - 20}")
    else:
        print(f"\n✅ Всі news URL з sitemap мають відповідники!")

    print("\n" + "="*80)

    return len(not_found) == 0


if __name__ == '__main__':
    # Перевірка old_url в базі
    ok1 = check_news_old_urls()

    # Перевірка URL з sitemap (якщо файл існує)
    sitemap_file = '/tmp/old_post_urls.txt'
    if os.path.exists(sitemap_file):
        ok2 = check_sitemap_urls(sitemap_file)
    else:
        print(f"\n⚠️  Файл {sitemap_file} не знайдено. Пропускаємо перевірку sitemap.")
        ok2 = True

    if ok1 and ok2:
        print("\n✅ ВСІ ПЕРЕВІРКИ ПРОЙШЛИ УСПІШНО!")
        sys.exit(0)
    else:
        print("\n❌ ЗНАЙДЕНО ПРОБЛЕМИ!")
        sys.exit(1)




