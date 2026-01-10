# Скрипти для перевірки URL перед міграцією

## Огляд

Цей набір скриптів забезпечує 100% гарантію що всі URL зі старого сайту працюють після міграції.

## Скрипти

### 1. `verify_all_urls.py`

Автоматично перевіряє всі URL зі старого sitemap на новому сайті.

**Використання:**
```bash
# Перевірити локально
python scripts/verify_all_urls.py --url-file /tmp/all_old_urls.txt --base-url http://localhost:8000

# Перевірити на staging/production
python scripts/verify_all_urls.py --url-file /tmp/all_old_urls.txt --base-url https://speakup-zc5s.onrender.com --save-results results.json
```

**Що перевіряє:**
- Чи URL повертає 200 OK (існує)
- Чи URL має правильний 301 редирект
- Чи редирект веде на правильний новий URL

**Результат:**
- Виводить детальний звіт
- Зберігає результати в JSON (опціонально)
- Повертає exit code 0 якщо все OK, 1 якщо є проблеми

### 2. `check_news_old_urls.py`

Перевіряє чи всі news статті в базі мають old_url_uk/old_url_ru.

**Використання:**
```bash
python scripts/check_news_old_urls.py
```

**Що перевіряє:**
- Чи всі статті мають old_url_uk
- Чи статті з RU версією мають old_url_ru
- Чи всі URL з post-sitemap мають відповідники в базі

## Перед міграцією

1. **Експорт URL зі старого sitemap:**
```bash
# Page URLs
curl -s "https://speak-up.com.ua/page-sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's|<loc>||;s|</loc>||' | sed 's|https://speak-up.com.ua||' | sort | uniq > /tmp/old_page_urls.txt

# Post URLs
curl -s "https://speak-up.com.ua/post-sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's|<loc>||;s|</loc>||' | sed 's|https://speak-up.com.ua||' | sort | uniq > /tmp/old_post_urls.txt

# Product URLs
curl -s "https://speak-up.com.ua/product-sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's|<loc>||;s|</loc>||' | sed 's|https://speak-up.com.ua||' | sort | uniq > /tmp/old_product_urls.txt

# Об'єднати
cat /tmp/old_page_urls.txt /tmp/old_post_urls.txt /tmp/old_product_urls.txt | sort | uniq > /tmp/all_old_urls.txt
```

2. **Перевірка news статей:**
```bash
python scripts/check_news_old_urls.py
```

3. **Запуск локального сервера:**
```bash
python manage.py runserver
```

4. **Перевірка всіх URL:**
```bash
python scripts/verify_all_urls.py --url-file /tmp/all_old_urls.txt --base-url http://localhost:8000
```

5. **Виправлення проблем** якщо знайдені

6. **Повторна перевірка** до повного проходження

## Після деплою на staging

```bash
python scripts/verify_all_urls.py --url-file /tmp/all_old_urls.txt --base-url https://speakup-zc5s.onrender.com --save-results verification_results.json
```

## Критерії успіху

✅ Всі URL мають статус 200 або правильний 301 редирект
✅ Жодної 404 помилки
✅ Жодної невірного редиректу
✅ Всі news статті мають old_url

## Важливо

- Перевірка має пройти на 100% перед міграцією домену
- Якщо знайдено проблеми - виправити та повторити перевірку
- Зберегти результати перевірки для документації




