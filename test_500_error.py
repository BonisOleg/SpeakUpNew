#!/usr/bin/env python3
"""
Скрипт для діагностики помилки 500 на головній сторінці
"""
import os
import sys
import django

# Встановлюємо production settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SpeakUp.settings.production')
django.setup()

from django.test import RequestFactory
from django.conf import settings
from apps.core.views import index
from apps.core.context_processors import seo_context

print("=" * 60)
print("ДІАГНОСТИКА ПОМИЛКИ 500")
print("=" * 60)

# Перевірка 1: Settings
print("\n1. Перевірка settings:")
print(f"   DEFAULT_OG_IMAGE: {getattr(settings, 'DEFAULT_OG_IMAGE', 'NOT FOUND')}")
print(f"   DEBUG: {settings.DEBUG}")
print(f"   ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")

# Перевірка 2: Context processor
print("\n2. Тестування seo_context:")
try:
    rf = RequestFactory()
    request = rf.get('/')
    request.META['HTTP_HOST'] = 'test.example.com'
    request.META['SERVER_NAME'] = 'test.example.com'
    request.META['SERVER_PORT'] = '80'
    result = seo_context(request)
    print(f"   ✅ seo_context працює")
    print(f"   default_og_image: {result.get('default_og_image', 'NOT FOUND')}")
except Exception as e:
    print(f"   ❌ ПОМИЛКА в seo_context: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Перевірка 3: Index view
print("\n3. Тестування index view:")
try:
    rf = RequestFactory()
    request = rf.get('/')
    request.META['HTTP_HOST'] = 'test.example.com'
    request.META['SERVER_NAME'] = 'test.example.com'
    request.META['SERVER_PORT'] = '80'
    response = index(request)
    print(f"   ✅ index view працює")
    print(f"   Status code: {response.status_code}")
    if response.status_code != 200:
        print(f"   ⚠️  Неочікуваний статус код: {response.status_code}")
except Exception as e:
    print(f"   ❌ ПОМИЛКА в index view: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Перевірка 4: Template rendering
print("\n4. Тестування рендерингу шаблону:")
try:
    from django.template.loader import render_to_string
    from apps.core.views import index
    rf = RequestFactory()
    request = rf.get('/')
    request.META['HTTP_HOST'] = 'test.example.com'
    request.META['SERVER_NAME'] = 'test.example.com'
    request.META['SERVER_PORT'] = '80'
    response = index(request)
    content = response.content.decode('utf-8')
    print(f"   ✅ Шаблон відрендерено успішно")
    print(f"   Розмір контенту: {len(content)} байт")
    if 'css-loader' in content:
        print(f"   ✅ css-loader знайдено в HTML")
    else:
        print(f"   ⚠️  css-loader не знайдено в HTML")
except Exception as e:
    print(f"   ❌ ПОМИЛКА при рендерингу: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ Всі перевірки пройдені успішно!")
print("=" * 60)

