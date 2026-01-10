# Команди для діагностики помилки 500 на Render

## КРИТИЧНО: Перевірка логів на Render

1. **Відкрийте Render Dashboard** → Ваш сервіс → **Logs**
2. **Шукайте останні помилки** з такими ключовими словами:
   - `Traceback`
   - `Error`
   - `AttributeError`
   - `ImportError`
   - `TemplateSyntaxError`
   - `TemplateDoesNotExist`
   - `ImproperlyConfigured`

## Команди для виконання в Render Shell (якщо доступний)

Якщо у вас є доступ до Render Shell, виконайте:

```bash
# 1. Перевірка наявності файлів
ls -la staticfiles/js/utils/css-loader.js
ls -la staticfiles/js/app-init.js

# 2. Перевірка settings
python manage.py shell -c "from django.conf import settings; print('DEFAULT_OG_IMAGE:', getattr(settings, 'DEFAULT_OG_IMAGE', 'NOT FOUND'))"

# 3. Перевірка context processor
python manage.py shell -c "
from django.test import RequestFactory
from apps.core.context_processors import seo_context
rf = RequestFactory()
request = rf.get('/')
request.META['HTTP_HOST'] = 'your-domain.onrender.com'
result = seo_context(request)
print('OK' if 'default_og_image' in result else 'ERROR')
"

# 4. Перевірка шаблону
python manage.py shell -c "
from django.template.loader import get_template
t = get_template('base.html')
print('Template OK')
"
```

## Найімовірніші причини помилки 500:

1. **Файл css-loader.js не зібрався через collectstatic**
   - Перевірте чи виконується `collectstatic` під час build
   - Перевірте чи файл є в `staticfiles/js/utils/css-loader.js`

2. **Помилка в шаблоні при рендерингу**
   - Перевірте логи на `TemplateSyntaxError`
   - Можливо проблема з `{% static %}` тегом

3. **Помилка в context processor**
   - Але ми вже виправили `DEFAULT_OG_IMAGE` з fallback

4. **Помилка в view при запиті до БД**
   - Перевірте чи БД доступна
   - Перевірте чи всі міграції виконані

5. **Помилка з імпортом ES модуля**
   - Можливо браузер не підтримує ES modules
   - Але це не має викликати 500 на сервері

## Що перевірити в Render Dashboard:

1. **Environment Variables:**
   - `DJANGO_SETTINGS_MODULE=SpeakUp.settings.production` ✅
   - `DATABASE_URL` ✅
   - `SECRET_KEY` ✅

2. **Build Logs:**
   - Чи виконується `collectstatic`?
   - Чи є помилки під час build?

3. **Runtime Logs:**
   - Шукайте останній Traceback перед помилкою 500
   - Копіюйте повний Traceback

## Найшвидший спосіб знайти проблему:

**Відкрийте логи Render і скопіюйте останній Traceback перед помилкою 500!**

Це покаже точно, де виникає помилка.




