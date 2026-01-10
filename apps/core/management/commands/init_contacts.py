"""
Management command для ініціалізації контактної інформації.
"""
from django.core.management.base import BaseCommand
from apps.core.models import ContactInfo


class Command(BaseCommand):
    help = 'Ініціалізує контактну інформацію з даними з сайту speak-up.com.ua'

    def handle(self, *args, **options):
        # Перевірити, чи вже є активний запис
        existing = ContactInfo.objects.filter(is_active=True).first()
        if existing:
            self.stdout.write(
                self.style.WARNING(
                    f'Активний запис контактів вже існує: {existing.phone_uk}'
                )
            )
            if not options.get('force', False):
                self.stdout.write(
                    self.style.ERROR('Використайте --force для перезапису')
                )
                return

        # Деактивувати всі існуючі записи
        ContactInfo.objects.filter(is_active=True).update(is_active=False)

        # Створити новий запис
        contact_info = ContactInfo.objects.create(
            phone_uk='+38 (093) 170-78-67',
            phone_international='+48 (459) 567-884',
            schedule_weekdays_uk='Пн-Пт: 10:00-21:30',
            schedule_weekdays_ru='Пн-Пт: 10:00-21:30',
            schedule_weekend_uk='Сб: 11:00-15:00',
            schedule_weekend_ru='Сб: 11:00-15:00',
            is_active=True
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Контактна інформація успішно створена: {contact_info.phone_uk}'
            )
        )





