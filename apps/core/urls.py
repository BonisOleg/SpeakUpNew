from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Головні сторінки
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('contacts', views.contacts, name='contacts'),
    path('faq', views.faq, name='faq'),
    path('testing', views.testing, name='testing'),

    # Homepage content forms
    path('submit-testimonial/', views.submit_testimonial, name='submit_testimonial'),
    path('get-testimonial-form/', views.get_testimonial_form, name='get_testimonial_form'),
    path('submit-consultation/', views.submit_consultation, name='submit_consultation'),

    # NEWS - ПЕРЕД catch-all! (КРИТИЧНО для SEO)
    path('news/', views.news_list, name='news_list'),
    path('news/<slug:slug>/', views.news_detail, name='news_detail'),

    # Feedback, Job, Shares
    path('feedback/', views.feedback_list, name='feedback'),
    path('job', views.job_list, name='job'),
    # Shares stubs (before general shares pattern)
    path('shares/kupy-2-urovnya-anglyjskogo-y-poluchy-eshhe-2-v-podarok/', views.shares_detail_stub, name='shares_detail_stub'),
    path('shares/page/<int:page>/', views.shares_page_stub, name='shares_page_stub'),
    path('shares/', views.shares_list, name='shares'),

    # Програми - список всіх програм (ПЕРЕД детальною сторінкою!)
    path('programs/', views.programs_list, name='programs_list'),
    # SEO Stub: Program (before dynamic pattern)
    path('programs/summer-camp-2021', views.summer_camp_2021_stub, name='summer_camp_2021_stub'),
    # Програми (динамічний slug)
    path('programs/<slug:slug>', views.program_detail, name='program_detail'),

    # Orphan: Локації (динамічний slug)
    path('school/<slug:slug>', views.school_location, name='school_location'),

    # SEO Stub Pages (ПЕРЕД catch-all!)
    # Specific stubs
    path('golovna-3/', views.golovna_3_stub, name='golovna_3_stub'),
    path('glavnaya-stranicza/', views.glavnaya_stranicza_stub, name='glavnaya_stranicza_stub'),
    path('sertyfikat/', views.sertyfikat_stub, name='sertyfikat_stub'),
    path('programma-loyalnosty/', views.programma_loyalnosty_stub, name='programma_loyalnosty_stub'),
    path('buy/', views.buy_stub, name='buy_stub'),
    path('dogovir-pro-nadannya-poslug-dostupu-do-elektronnogo-kabinetu-speak-up-2/', views.dogovir_stub, name='dogovir_stub'),

    # Orphan: Міста (динамічний slug) - В КІНЦІ як catch-all
    path('<slug:city>', views.city_page, name='city_page'),
]

