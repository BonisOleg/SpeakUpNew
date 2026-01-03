#!/bin/bash
# Тест реального запиту до головної сторінки на Render

echo "=== ТЕСТ РЕАЛЬНОГО ЗАПИТУ ==="
echo ""

echo "1. Тест через Django test client:"
echo "python manage.py shell -c \"
from django.test import Client
client = Client(HTTP_HOST='speakup-zc5s.onrender.com')
try:
    response = client.get('/')
    print('Status:', response.status_code)
    if response.status_code == 500:
        print('Content:', response.content.decode('utf-8')[:500])
except Exception as e:
    print('ERROR:', type(e).__name__, ':', str(e))
    import traceback
    traceback.print_exc()
\""
echo ""

echo "2. Тест з DEBUG=True для отримання повного Traceback:"
echo "python manage.py shell -c \"
import os
os.environ['DEBUG'] = 'True'
from django.conf import settings
settings.DEBUG = True
from django.test import Client
client = Client(HTTP_HOST='speakup-zc5s.onrender.com')
try:
    response = client.get('/')
    print('Status:', response.status_code)
except Exception as e:
    print('ERROR:', type(e).__name__, ':', str(e))
    import traceback
    traceback.print_exc()
\""
echo ""

echo "3. Перевірка чи всі context processors працюють:"
echo "python manage.py shell -c \"
from django.test import RequestFactory
from django.conf import settings
rf = RequestFactory()
request = rf.get('/')
request.META['HTTP_HOST'] = 'speakup-zc5s.onrender.com'
request.META['SERVER_NAME'] = 'speakup-zc5s.onrender.com'
request.META['SERVER_PORT'] = '443'
request.META['HTTP_X_FORWARDED_PROTO'] = 'https'

# Тест кожного context processor
from apps.core.context_processors import seo_context, feature_flags
from apps.leads.context_processors import running_line_context

print('Testing seo_context...')
try:
    result = seo_context(request)
    print('✅ seo_context OK')
except Exception as e:
    print('❌ seo_context ERROR:', e)

print('Testing feature_flags...')
try:
    result = feature_flags(request)
    print('✅ feature_flags OK')
except Exception as e:
    print('❌ feature_flags ERROR:', e)

print('Testing running_line_context...')
try:
    result = running_line_context(request)
    print('✅ running_line_context OK')
except Exception as e:
    print('❌ running_line_context ERROR:', e)
\""
echo ""

echo "4. Тест рендерингу шаблону з реальним контекстом:"
echo "python manage.py shell -c \"
from django.test import RequestFactory
from django.template.loader import render_to_string
from apps.core.views import index
rf = RequestFactory()
request = rf.get('/')
request.META['HTTP_HOST'] = 'speakup-zc5s.onrender.com'
request.META['SERVER_NAME'] = 'speakup-zc5s.onrender.com'
request.META['SERVER_PORT'] = '443'
request.META['HTTP_X_FORWARDED_PROTO'] = 'https'

try:
    response = index(request)
    print('✅ View працює, status:', response.status_code)
    content = response.content.decode('utf-8')
    print('Content length:', len(content))
except Exception as e:
    print('❌ View ERROR:', type(e).__name__, ':', str(e))
    import traceback
    traceback.print_exc()
\""
echo ""

