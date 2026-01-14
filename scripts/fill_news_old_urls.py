#!/usr/bin/env python
"""
Скрипт для заповнення old_url_uk та old_url_ru для news статей.
Може бути запущено як: python manage.py shell < scripts/fill_news_old_urls.py
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SpeakUp.settings.develop')
django.setup()

from apps.core.models import NewsArticle

def get_old_urls_from_file():
    """Зчитує список старих URL новин з файлу."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    urls_file = os.path.join(script_dir, 'all_news_urls.txt')

    if not os.path.exists(urls_file):
        print(f"⚠️  Файл {urls_file} не знайдено!")
        return []

    with open(urls_file, 'r', encoding='utf-8') as f:
        urls = [line.strip() for line in f if line.strip()]

    print(f"✅ Прочитано {len(urls)} URL з {urls_file}")
    return urls


def fill_news_old_urls():
    """
    Заповнює old_url_uk та old_url_ru для news статей.

    Логіка:
    - Для англійської версії (без /ru/) → old_url_uk
    - Для російської версії (з /ru/) → old_url_ru
    """
    old_urls = get_old_urls_from_file()

    if not old_urls:
        print("❌ Список URL порожній. Не можу продовжити.")
        return False

    print("\n" + "="*80)
    print("ЗАПОВНЕННЯ old_url ДЛЯ NEWS СТАТЕЙ")
    print("="*80 + "\n")

    # Створюємо mapping: slug → old_url
    slug_to_old_url = {}
    for url_path in old_urls:
        slug = url_path.split('/news/')[1].rstrip('/') if '/news/' in url_path else ''
        if slug:
            slug_to_old_url[slug] = url_path

    print(f"📋 Створено mapping для {len(slug_to_old_url)} старих URL\n")

    # Отримуємо всі статті
    articles = NewsArticle.objects.all()

    updated_uk = 0
    updated_ru = 0
    skipped = 0

    for article in articles:
        # Заповнення old_url_uk (за slug_uk)
        if article.slug_uk in slug_to_old_url and not article.old_url_uk:
            article.old_url_uk = slug_to_old_url[article.slug_uk]
            article.save(update_fields=['old_url_uk'])
            updated_uk += 1
            print(f"✅ [UK] {article.title_uk}: {article.old_url_uk}")

        # Заповнення old_url_ru (за slug_ru)
        if article.slug_ru and article.slug_ru in slug_to_old_url and not article.old_url_ru:
            article.old_url_ru = slug_to_old_url[article.slug_ru]
            article.save(update_fields=['old_url_ru'])
            updated_ru += 1
            print(f"✅ [RU] {article.title_ru or article.title_uk}: {article.old_url_ru}")
        elif article.slug_uk in slug_to_old_url and article.slug_ru and not article.old_url_ru:
            # Якщо RU версія немає свого URL, використовуємо UK версію з /ru префіксом
            old_url_ru = '/ru' + slug_to_old_url[article.slug_uk]
            article.old_url_ru = old_url_ru
            article.save(update_fields=['old_url_ru'])
            updated_ru += 1
            print(f"✅ [RU fallback] {article.title_ru or article.title_uk}: {old_url_ru}")

    print("\n" + "="*80)
    print(f"📊 РЕЗУЛЬТАТИ ЗАПОВНЕННЯ:")
    print(f"   ✅ Оновлено UK версій: {updated_uk}")
    print(f"   ✅ Оновлено RU версій: {updated_ru}")
    print(f"   📝 Всього статей: {articles.count()}")
    print("="*80)

    return True


def verify_coverage():
    """Перевіряє скільки статей мають old_url."""
    articles = NewsArticle.objects.all()

    with_uk = articles.filter(old_url_uk__isnull=False).exclude(old_url_uk='').count()
    with_ru = articles.filter(slug_ru__isnull=False).exclude(slug_ru='').filter(
        old_url_ru__isnull=False
    ).exclude(old_url_ru='').count()

    print("\n" + "="*80)
    print("ПЕРЕВІРКА ПОКРИТТЯ old_url:")
    print("="*80)
    print(f"   UK версії з old_url: {with_uk}/{articles.count()} ({100*with_uk//articles.count()}%)")
    print(f"   RU версії з old_url: {with_ru}/{articles.filter(slug_ru__isnull=False).exclude(slug_ru='').count()}")
    print("="*80)


if __name__ == '__main__':
    try:
        fill_news_old_urls()
        verify_coverage()
        print("\n✅ Скрипт завершено успішно!")
    except Exception as e:
        print(f"\n❌ Помилка: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
