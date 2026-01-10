#!/bin/bash
# Команди для діагностики помилки 500 на Render

echo "=========================================="
echo "ДІАГНОСТИКА ПОМИЛКИ 500 - КОМАНДИ"
echo "=========================================="
echo ""

echo "1. Перевірка синтаксису Python файлів:"
echo "   python3 -m py_compile apps/core/context_processors.py"
echo "   python3 -m py_compile apps/core/views.py"
echo "   python3 -m py_compile SpeakUp/settings/production.py"
echo ""

echo "2. Перевірка наявності всіх необхідних файлів:"
echo "   ls -la static/js/utils/css-loader.js"
echo "   ls -la static/js/app-init.js"
echo "   ls -la templates/base.html"
echo ""

echo "3. Перевірка синтаксису шаблонів (локально з develop settings):"
echo "   DJANGO_SETTINGS_MODULE=SpeakUp.settings.develop python3 manage.py check --deploy"
echo ""

echo "4. Перевірка context_processors без бази даних:"
echo "   python3 -c \""
echo "   import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SpeakUp.settings.production');"
echo "   import django; django.setup();"
echo "   from django.test import RequestFactory;"
echo "   from apps.core.context_processors import seo_context;"
echo "   rf = RequestFactory();"
echo "   request = rf.get('/');"
echo "   request.META['HTTP_HOST'] = 'test.com';"
echo "   result = seo_context(request);"
echo "   print('OK:', 'default_og_image' in result)\""
echo ""

echo "5. Перевірка імпортів:"
echo "   python3 -c \""
echo "   import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SpeakUp.settings.production');"
echo "   import django; django.setup();"
echo "   from django.conf import settings;"
echo "   print('DEFAULT_OG_IMAGE:', getattr(settings, 'DEFAULT_OG_IMAGE', 'NOT FOUND'))\""
echo ""

echo "6. Перевірка шаблону base.html на помилки:"
echo "   grep -n '{%' templates/base.html | head -20"
echo "   grep -n '{{' templates/base.html | head -20"
echo ""

echo "7. Перевірка чи всі static files зібрані:"
echo "   ls -la staticfiles/js/utils/css-loader.js 2>/dev/null || echo 'Файл не знайдено в staticfiles'"
echo ""

echo "8. На Render - перевірка логів (виконайте в Render Dashboard):"
echo "   - Відкрийте Logs в Render Dashboard"
echo "   - Шукайте помилки з 'Traceback' або 'Error'"
echo "   - Шукайте 'AttributeError', 'ImportError', 'TemplateSyntaxError'"
echo ""

echo "9. На Render - перевірка змінних оточення:"
echo "   - Перевірте чи встановлено DJANGO_SETTINGS_MODULE=SpeakUp.settings.production"
echo "   - Перевірте чи встановлено DATABASE_URL"
echo "   - Перевірте чи встановлено SECRET_KEY"
echo ""

echo "10. Тестовий запит до healthz (має повертати 200):"
echo "    curl -I https://your-render-url.onrender.com/healthz"
echo ""

echo "=========================================="
echo "ВИКОНАЙТЕ ЦІ КОМАНДИ ПОЧЕРГОВО"
echo "=========================================="




