"""
Django management команда для додавання акцій у бігучу стрічку.
Використання: python manage.py add_promotions_to_running_line
"""
from django.core.management.base import BaseCommand
from apps.leads.models import RunningLineText


class Command(BaseCommand):
    help = 'Додає акції у бігучу стрічку зі сторінки акцій'

    def handle(self, *args, **options):
        self.stdout.write('=' * 80)
        self.stdout.write('ДОДАВАННЯ АКЦІЙ У БІГУЧУ СТРІЧКУ')
        self.stdout.write('=' * 80)

        # Акції з views.py (shares_list)
        promotions = [
            {
                'title_uk': 'Акція 1+1 = 4',
                'description_uk': 'Купуй 2 рівні англійської і ще 2 отримай в подарунок',
            },
        ]

        # Створюємо тексти для бігучеї стрічки
        running_line_texts = []

        for idx, promotion in enumerate(promotions, start=1):
            # Українська версія
            text_uk = f"🎉 {promotion['title_uk']}: {promotion['description_uk']} | Деталі на сторінці акцій"
            running_line_texts.append({
                'text': text_uk,
                'order': idx,
                'is_active': True
            })

        # Додаємо також короткі варіанти
        short_texts = [
            {
                'text': '🔥 Акція 1+1=4! Купуй 2 рівні - отримуй 4! Економія до 50%!',
                'order': 0,
                'is_active': True
            },
            {
                'text': '🎁 Спеціальна пропозиція: 2 рівні англійської за ціною одного!',
                'order': 1,
                'is_active': True
            },
            {
                'text': '💰 Економія до 15,900 грн! Акція 1+1=4 діє до кінця місяця!',
                'order': 2,
                'is_active': True
            },
        ]

        # Об'єднуємо всі тексти
        all_texts = short_texts + running_line_texts

        # Видаляємо старі записи, якщо використовується --force
        if options.get('force', False):
            RunningLineText.objects.all().delete()
            self.stdout.write(self.style.WARNING('\nВидалено всі існуючі тексти бігучеї стрічки\n'))
        else:
            existing_count = RunningLineText.objects.count()
            if existing_count > 0:
                self.stdout.write(
                    self.style.WARNING(
                        f'\n⚠️  Знайдено {existing_count} існуючих текстів. '
                        'Використайте --force для перезапису.\n'
                    )
                )
                # Показуємо існуючі тексти
                for text in RunningLineText.objects.all()[:5]:
                    self.stdout.write(f'   - {text.text[:60]}...')
                return

        # Створюємо нові записи
        created_count = 0
        for text_data in all_texts:
            # Перевіряємо довжину тексту (максимум 200 символів)
            text = text_data['text'][:200]

            RunningLineText.objects.create(
                text=text,
                order=text_data['order'],
                is_active=text_data['is_active']
            )
            created_count += 1
            self.stdout.write(self.style.SUCCESS(f'✓ Додано: {text[:60]}...'))

        # Підсумок
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.SUCCESS('✅ ГОТОВО!'))
        self.stdout.write('=' * 80)
        self.stdout.write(f'\n📊 СТАТИСТИКА:')
        self.stdout.write(f'   Створено текстів: {created_count}')
        self.stdout.write(f'   Активних текстів: {RunningLineText.objects.filter(is_active=True).count()}')
        self.stdout.write(f'\n💡 ПРИМІТКА:')
        self.stdout.write('   Бігуча стрічка відображає перший активний текст з найменшим порядком.')
        self.stdout.write('   Для зміни тексту використовуйте Django Admin або змініть поле order.')

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Видалити всі існуючі тексти перед створенням нових',
        )

