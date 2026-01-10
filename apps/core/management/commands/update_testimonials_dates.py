"""
Django management команда для оновлення дат у всіх відгуках на випадкові дати.
Діапазон: з 2023 року до кінця 2025 року.
Використання: python manage.py update_testimonials_dates
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import random
from apps.core.models import Testimonial


class Command(BaseCommand):
    help = 'Оновлює дати у всіх відгуках на випадкові дати з 2023-2025 років'

    def handle(self, *args, **options):
        # Початкова дата: 1 січня 2023
        start_date = datetime(2023, 1, 1, tzinfo=timezone.get_current_timezone())

        # Кінцева дата: 31 грудня 2025
        end_date = datetime(2025, 12, 31, 23, 59, 59, tzinfo=timezone.get_current_timezone())

        # Отримуємо всі відгуки
        testimonials = Testimonial.objects.all()
        total_count = testimonials.count()

        if total_count == 0:
            self.stdout.write(
                self.style.WARNING('Не знайдено відгуків для оновлення.')
            )
            return

        self.stdout.write(f'Оновлення дат у {total_count} відгуках...\n')

        updated_count = 0

        for testimonial in testimonials:
            # Генеруємо випадкову дату в діапазоні
            time_between = end_date - start_date
            days_between = time_between.days
            random_days = random.randrange(days_between)
            random_date = start_date + timedelta(days=random_days)

            # Додаємо випадковий час (години, хвилини, секунди)
            random_hours = random.randint(0, 23)
            random_minutes = random.randint(0, 59)
            random_seconds = random.randint(0, 59)
            random_date = random_date.replace(
                hour=random_hours,
                minute=random_minutes,
                second=random_seconds
            )

            # Оновлюємо дату (використовуємо update для обходу auto_now_add)
            Testimonial.objects.filter(pk=testimonial.pk).update(created_at=random_date)

            updated_count += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Оновлено: {testimonial.name} - {random_date.strftime("%d.%m.%Y %H:%M")}'
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nГотово! Оновлено {updated_count} відгуків.'
            )
        )




