# Generated manually for moving RunningLineText from leads to core

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_alter_consultationrequest_phone'),
    ]

    operations = [
        migrations.CreateModel(
            name='RunningLineText',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=200, verbose_name='Текст')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активний')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Порядок')),
            ],
            options={
                'verbose_name': 'Текст бігучої стрічки',
                'verbose_name_plural': 'Тексти бігучої стрічки',
                'ordering': ['order', '-id'],
                'db_table': 'leads_runninglinetext',  # Використовуємо існуючу таблицю
            },
        ),
    ]

