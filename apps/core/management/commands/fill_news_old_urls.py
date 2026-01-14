"""
Django management команда для заповнення old_url_uk та old_url_ru для news статей.

Використання:
    python manage.py fill_news_old_urls
"""
from django.core.management.base import BaseCommand
from apps.core.models import NewsArticle
import os


class Command(BaseCommand):
    help = 'Заповнює old_url_uk та old_url_ru для news статей зі списку старих URL'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Показати що буде зроблено без збереження в БД',
        )
        parser.add_argument(
            '--verify-only',
            action='store_true',
            help='Тільки перевірити покриття без заповнення',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        verify_only = options['verify_only']

        # Шлях до файлу зі старими URL
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
        urls_file = os.path.join(base_dir, 'scripts', 'all_news_urls.txt')

        if not os.path.exists(urls_file):
            self.stdout.write(
                self.style.ERROR(f'❌ Файл {urls_file} не знайдено!')
            )
            return

        # Читаємо старі URL
        with open(urls_file, 'r', encoding='utf-8') as f:
            old_urls = [line.strip() for line in f if line.strip()]

        self.stdout.write(f'📋 Прочитано {len(old_urls)} старих URL з {urls_file}\n')

        # Створюємо mapping: slug → old_url
        slug_to_old_url = {}
        for url_path in old_urls:
            slug = url_path.split('/news/')[1].rstrip('/') if '/news/' in url_path else ''
            if slug:
                slug_to_old_url[slug] = url_path

        self.stdout.write(f'📋 Створено mapping для {len(slug_to_old_url)} старих URL\n')

        # Отримуємо всі статті
        articles = NewsArticle.objects.all()

        if verify_only:
            self._verify_coverage(articles)
            return

        updated_uk = 0
        updated_ru = 0
        skipped = 0

        self.stdout.write('=' * 80)
        self.stdout.write('ЗАПОВНЕННЯ old_url ДЛЯ NEWS СТАТЕЙ')
        self.stdout.write('=' * 80 + '\n')

        for article in articles:
            # Заповнення old_url_uk (за slug_uk)
            if article.slug_uk in slug_to_old_url and not article.old_url_uk:
                article.old_url_uk = slug_to_old_url[article.slug_uk]
                if not dry_run:
                    article.save(update_fields=['old_url_uk'])
                updated_uk += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ [UK] {article.title_uk}: {article.old_url_uk}')
                )

            # Заповнення old_url_ru (за slug_ru)
            if article.slug_ru and article.slug_ru in slug_to_old_url and not article.old_url_ru:
                article.old_url_ru = slug_to_old_url[article.slug_ru]
                if not dry_run:
                    article.save(update_fields=['old_url_ru'])
                updated_ru += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ [RU] {article.title_ru or article.title_uk}: {article.old_url_ru}')
                )
            elif article.slug_uk in slug_to_old_url and article.slug_ru and not article.old_url_ru:
                # Якщо RU версія немає свого URL, використовуємо UK версію з /ru префіксом
                old_url_ru = '/ru' + slug_to_old_url[article.slug_uk]
                article.old_url_ru = old_url_ru
                if not dry_run:
                    article.save(update_fields=['old_url_ru'])
                updated_ru += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ [RU fallback] {article.title_ru or article.title_uk}: {old_url_ru}')
                )

        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(f'📊 РЕЗУЛЬТАТИ ЗАПОВНЕННЯ:')
        if dry_run:
            self.stdout.write(self.style.WARNING('   ⚠️  DRY RUN - зміни НЕ збережено'))
        self.stdout.write(f'   ✅ Оновлено UK версій: {updated_uk}')
        self.stdout.write(f'   ✅ Оновлено RU версій: {updated_ru}')
        self.stdout.write(f'   📝 Всього статей: {articles.count()}')
        self.stdout.write('=' * 80)

        if not dry_run:
            self._verify_coverage(articles)

    def _verify_coverage(self, articles):
        """Перевіряє скільки статей мають old_url."""
        with_uk = articles.filter(old_url_uk__isnull=False).exclude(old_url_uk='').count()
        with_ru = articles.filter(slug_ru__isnull=False).exclude(slug_ru='').filter(
            old_url_ru__isnull=False
        ).exclude(old_url_ru='').count()
        total_ru = articles.filter(slug_ru__isnull=False).exclude(slug_ru='').count()

        self.stdout.write('\n' + '=' * 80)
        self.stdout.write('ПЕРЕВІРКА ПОКРИТТЯ old_url:')
        self.stdout.write('=' * 80)
        self.stdout.write(f'   UK версії з old_url: {with_uk}/{articles.count()} ({100*with_uk//articles.count() if articles.count() > 0 else 0}%)')
        if total_ru > 0:
            self.stdout.write(f'   RU версії з old_url: {with_ru}/{total_ru} ({100*with_ru//total_ru if total_ru > 0 else 0}%)')
        self.stdout.write('=' * 80)
