#!/usr/bin/env python
"""
Скрипт для оновлення досягнень Speak Up.
Виконується: python manage.py shell < scripts/update_achievements.py
Або: python scripts/update_achievements.py
"""
import os
import sys
import django

# Налаштування Django
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SpeakUp.settings.develop')
django.setup()

from apps.core.models import Achievement

# Дані для оновлення (топ-4 досягнення)
ACHIEVEMENTS_DATA = [
    {
        'number': 500000,
        'suffix': '+',
        'label_uk': 'Студентів у світі',
        'label_ru': 'Студентов в мире',
        'order': 1,
        'is_active': True
    },
    {
        'number': 11,
        'suffix': '',
        'label_uk': 'Країн на 4 континентах',
        'label_ru': 'Стран на 4 континентах',
        'order': 2,
        'is_active': True
    },
    {
        'number': 85,
        'suffix': '%',
        'label_uk': 'Середня оцінка студентів',
        'label_ru': 'Средняя оценка студентов',
        'order': 3,
        'is_active': True
    },
    {
        'number': 5000,
        'suffix': '+',
        'label_uk': 'Студентів в Україні зараз',
        'label_ru': 'Студентов в Украине сейчас',
        'order': 4,
        'is_active': True
    }
]

def update_achievements():
    """Оновлює або створює досягнення"""
    print('Оновлення досягнень Speak Up...\n')

    # Деактивувати всі існуючі досягнення
    Achievement.objects.update(is_active=False)
    print('Деактивовано всі існуючі досягнення\n')

    created_count = 0
    updated_count = 0

    for data in ACHIEVEMENTS_DATA:
        achievement, created = Achievement.objects.update_or_create(
            number=data['number'],
            suffix=data['suffix'],
            defaults={
                'label_uk': data['label_uk'],
                'label_ru': data['label_ru'],
                'order': data['order'],
                'is_active': data['is_active']
            }
        )

        if created:
            created_count += 1
            print(f'✓ Створено: {achievement}')
        else:
            updated_count += 1
            print(f'✓ Оновлено: {achievement}')

    print(f'\nГотово! Створено: {created_count}, оновлено: {updated_count}')
    print(f'Активних досягнень: {Achievement.objects.filter(is_active=True).count()}')

if __name__ == '__main__':
    try:
        update_achievements()
    except Exception as e:
        print(f'Помилка: {e}', file=sys.stderr)
        sys.exit(1)







