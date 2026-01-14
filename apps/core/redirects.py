"""
Mapping старих URL на нові для 301 редиректів.
Всі URL мають варіанти з trailing slash та без (обробляється в middleware).
"""

REDIRECTS = {
    # ===== WOOCOMMERCE ПРОДУКТИ → ПРОГРАМИ =====
    '/pidgotovka-do-ispitu-ielts': '/programs/ielts',
    '/pidgotovka-do-zno-z-anglijskoi-movi': '/programs/pidgotovka-zno',
    '/pidgotovka-do-ispitu-toefl': '/programs/toefl',
    '/anglijska-dlya-ditej-kids-30': '/programs/kids',
    '/product/misyacz-bezlimitu/': '/programs/bezlimitnij-onlajn-kurs-anglijskoyi-movi',
    '/2-rivni-anglijskoji-movi': '/programs/english-for-beginners',
    '/4-rivni-anglijskoji-movi-10-12-misyacziv-navchannya': '/programs/group',
    '/2-rivni-6-misyacziv-navchannya': '/programs/group',
    '/3-rivni-anglijskoji-movi_prodovzhennya': '/programs/group',
    '/5-rivni-anglijskoji-movi-prodovgennya': '/programs/group',

    # ===== ОСНОВНІ СТОРІНКИ (з trailing slash) =====
    '/home/': '/',
    '/about/': '/about',
    '/contact/': '/contacts',
    '/faqs/': '/faq',
    '/blog/': '/news/',
    '/pro-shkolu/': '/about',

    # ===== ОСНОВНІ СТОРІНКИ (без trailing slash) =====
    '/home': '/',
    '/contact': '/contacts',
    '/faqs': '/faq',
    '/blog': '/news/',
    '/pro-shkolu': '/about',

    # ===== РОСІЙСЬКІ ВЕРСІЇ (з language prefix) =====
    '/ru/contact/': '/ru/contacts',
    '/ru/contact': '/ru/contacts',

    # ===== ПРОГРАМИ (trailing slash) =====
    '/programs/toefl/': '/programs/toefl',
    '/programs/ielts/': '/programs/ielts',
    '/programs/group/': '/programs/group',
    '/programs/individual/': '/programs/individual',
    '/courses/': '/programs/',
    '/courses': '/programs/',
    '/shop1/': '/programs/',
    '/shop1': '/programs/',

    # ===== ВАКАНСІЇ =====
    '/become-a-teacher/': '/job',
    '/become-a-teacher': '/job',

    # ===== ЗАСТАРІЛІ СТОРІНКИ → ГОЛОВНА =====
    '/members/': '/',
    '/members': '/',
    '/profile/': '/',
    '/profile': '/',
    '/portfolio-grid/': '/',
    '/portfolio-grid': '/',
    '/portfolio-masonry/': '/',
    '/portfolio-masonry': '/',
    '/portfolio-multigrid/': '/',
    '/portfolio-multigrid': '/',
    '/gallery/': '/',
    '/gallery': '/',
    '/booked-events/': '/',
    '/booked-events': '/',
    '/sample-page/': '/',
    '/sample-page': '/',
    '/test-home-page/': '/',
    '/test-home-page': '/',
    '/test-main-ssv': '/',
    '/test-main-ssv/': '/',
    '/result': '/testing',
    '/result/': '/testing',
    '/1': '/',
    '/1/': '/',

    # ===== LANDING PAGES (застарілі) =====
    '/lp-checkout/': '/',
    '/lp-checkout': '/',
    '/lp-courses/': '/',
    '/lp-courses': '/',
    '/lp-profile/': '/',
    '/lp-profile': '/',

    # ===== MEMBERSHIP ACCOUNT (застарілі) =====
    '/membership-account/': '/',
    '/membership-account': '/',
    '/membership-account/membership-billing/': '/',
    '/membership-account/membership-billing': '/',
    '/membership-account/membership-cancel/': '/',
    '/membership-account/membership-cancel': '/',
    '/membership-account/membership-checkout/': '/',
    '/membership-account/membership-checkout': '/',
    '/membership-account/membership-confirmation/': '/',
    '/membership-account/membership-confirmation': '/',
    '/membership-account/membership-invoice/': '/',
    '/membership-account/membership-invoice': '/',
    '/membership-account/membership-levels/': '/',
    '/membership-account/membership-levels': '/',

    # ===== СТАРІ ГОЛОВНІ СТОРІНКИ (застарілі) =====
    # /golovna-3/ removed - now has stub page
    '/golovna-dnipro/': '/',
    '/golovna-dnipro': '/',
    '/golovna-kharkiv/': '/',
    '/golovna-kharkiv': '/',
    '/golovna-kriviy-rig/': '/',
    '/golovna-kriviy-rig': '/',
    '/golovna-lviv/': '/',
    '/golovna-lviv': '/',
    '/golovna-odesa/': '/',
    '/golovna-odesa': '/',

    # ===== КИРИЛИЧНІ URL (застарілі) =====
    '/активность/': '/',
    '/активность': '/',
    '/пользователи/': '/',
    '/пользователи': '/',

    # ===== СПЕЦІАЛЬНІ СТОРІНКИ =====
    '/camp-learning': '/programs/camp',
    '/camp-learning/': '/programs/camp',
    # /sertyfikat/ removed - now has stub page
    # /programa-loyalnosti/ removed - now has stub page

    # ===== SHARES (спеціальні сторінки) =====
    # /shares/black-friday-znyzhky-na-onlajn-kursy-z-anglijskoji/ - це має працювати через /shares/
    # але якщо сторінка не існує, редирект на /shares/

    # ===== НЕПРАВИЛЬНІ ПРЕФІКСИ МІСТ (мало бути без префіксу для UK) =====
    '/ua/lvov': '/lvov',
    '/ua/lvov/': '/lvov',
    '/ua/harkov': '/harkov',
    '/ua/harkov/': '/harkov',
    '/ua/dnepr': '/dnepr',
    '/ua/dnepr/': '/dnepr',
    '/ua/odessa': '/odessa',
    '/ua/odessa/': '/odessa',

    # ===== НЕПРАВИЛЬНІ ПРЕФІКСИ ШКІЛ =====
    '/ua/school/chervonoi-kalini': '/school/chervonoi-kalini',
    '/ua/school/chervonoi-kalini/': '/school/chervonoi-kalini',
    '/ua/school/minskaya': '/school/minskaya',
    '/ua/school/minskaya/': '/school/minskaya',
    '/ua/school/sumskaya': '/school/sumskaya',
    '/ua/school/sumskaya/': '/school/sumskaya',
    '/ua/school/poznyaki': '/school/poznyaki',
    '/ua/school/poznyaki/': '/school/poznyaki',
    '/ua/school/levoberezhnaya': '/school/levoberezhnaya',
    '/ua/school/levoberezhnaya/': '/school/levoberezhnaya',
    '/ua/school/universitet': '/school/universitet',
    '/ua/school/universitet/': '/school/universitet',
    '/ua/school/vokzalnaya': '/school/vokzalnaya',
    '/ua/school/vokzalnaya/': '/school/vokzalnaya',
    '/ua/school/jitomirskaya': '/school/jitomirskaya',
    '/ua/school/jitomirskaya/': '/school/jitomirskaya',
    '/ua/school/goloseevskaya': '/school/goloseevskaya',
    '/ua/school/goloseevskaya/': '/school/goloseevskaya',
    '/ua/school/monomakha': '/school/monomakha',
    '/ua/school/monomakha/': '/school/monomakha',
    '/ua/school/metallurgov': '/school/metallurgov',
    '/ua/school/metallurgov/': '/school/metallurgov',
    '/ua/school/chernovola': '/school/chernovola',
    '/ua/school/chernovola/': '/school/chernovola',
    '/ua/school/ekaterininskaya': '/school/ekaterininskaya',
    '/ua/school/ekaterininskaya/': '/school/ekaterininskaya',

    # ===== WORDPRESS КАТЕГОРІЇ → /news/ =====
    # Типові категорії блогу редирекціються на список новин
    '/category/': '/news/',
    '/category': '/news/',
    '/bez-kategoriї/': '/news/',
    '/bez-kategoriї': '/news/',
    '/bez-kategorii/': '/news/',
    '/bez-kategorii': '/news/',
    '/bez-kategorii-news/': '/news/',
    '/bez-kategorii-news': '/news/',

    # ===== WORDPRESS ТЕГИ → /news/ =====
    # Всі теги редирекціються на список новин (теги не реалізовані на новому сайті)
    '/tag/': '/news/',
    '/tag': '/news/',
    '/polezno/': '/news/',
    '/polezno': '/news/',
    '/english/': '/news/',
    '/english': '/news/',

    # ===== WORDPRESS АРХІВИ (ДАТОВАНІ) → /news/ =====
    # Архіви за місяцями/роками редирекціються на список всіх новин
    '/2024/': '/news/',
    '/2024': '/news/',
    '/2023/': '/news/',
    '/2023': '/news/',
    '/2022/': '/news/',
    '/2022': '/news/',
    '/2021/': '/news/',
    '/2021': '/news/',
    '/2020/': '/news/',
    '/2020': '/news/',
    '/2019/': '/news/',
    '/2019': '/news/',

    # ===== WORDPRESS ПАГІНАЦІЯ НОВИН → /news/ =====
    # Сторінки пагінації редирекціються на першу сторінку
    '/blog/page/': '/news/',
    '/blog/page': '/news/',
    '/news/page/': '/news/',
    '/news/page': '/news/',
    '/page/': '/',
    '/page': '/',

    # ===== WORDPRESS АВТОРИ → /news/ =====
    # Архіви авторів редирекціються на список новин
    '/author/': '/news/',
    '/author': '/news/',

    # ===== WORDPRESS ПЛАГІНИ РЕДИРЕКТІВ =====
    # Типові URL бібліотек/плагінів WordPress
    '/redirect/': '/',
    '/redirect': '/',
    '/sitemap.html': '/sitemap.xml',
    '/sitemap.html/': '/sitemap.xml',

    # ===== РОСІЙСЬКІ ВЕРСІЇ КАТЕГОРІЙ/ТЕГІВ =====
    '/ru/category/': '/ru/news/',
    '/ru/category': '/ru/news/',
    '/ru/tag/': '/ru/news/',
    '/ru/tag': '/ru/news/',
    '/ru/blog/page/': '/ru/news/',
    '/ru/blog/page': '/ru/news/',
    '/ru/author/': '/ru/news/',
    '/ru/author': '/ru/news/',

    # ===== ТИПОВІ 404 URL ДЛЯ БЛОГА =====
    # Коли користувач намагається знайти конкретну новину через пошук
    '/bez-kategoriї/page/': '/news/',
    '/bez-kategoriї/page': '/news/',
    '/category/uncategorized/': '/news/',
    '/category/uncategorized': '/news/',
}


