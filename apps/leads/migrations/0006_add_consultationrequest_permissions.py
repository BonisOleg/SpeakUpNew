# Generated manually for adding permissions for ConsultationRequest proxy model

from django.db import migrations


def create_proxy_permissions(apps, schema_editor):
    """
    Створює permissions для proxy моделі ConsultationRequest
    """
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')

    # Отримуємо ContentType для додатку leads з моделлю consultationrequest
    try:
        content_type = ContentType.objects.get(app_label='leads', model='consultationrequest')
    except ContentType.DoesNotExist:
        # Створюємо ContentType якщо його немає
        content_type = ContentType.objects.create(
            app_label='leads',
            model='consultationrequest'
        )

    # Створюємо permissions
    permissions = [
        ('add_consultationrequest', 'Can add Заявка footer'),
        ('change_consultationrequest', 'Can change Заявка footer'),
        ('delete_consultationrequest', 'Can delete Заявка footer'),
        ('view_consultationrequest', 'Can view Заявка footer'),
    ]

    for codename, name in permissions:
        Permission.objects.get_or_create(
            codename=codename,
            content_type=content_type,
            defaults={'name': name}
        )


def remove_proxy_permissions(apps, schema_editor):
    """
    Видаляє permissions для proxy моделі (для rollback)
    """
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')

    try:
        content_type = ContentType.objects.get(app_label='leads', model='consultationrequest')
        Permission.objects.filter(content_type=content_type).delete()
        content_type.delete()
    except ContentType.DoesNotExist:
        pass


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0005_update_verbose_names_and_add_proxy'),
        ('contenttypes', '__latest__'),
        ('auth', '__latest__'),
    ]

    operations = [
        migrations.RunPython(
            create_proxy_permissions,
            reverse_code=remove_proxy_permissions
        ),
    ]

