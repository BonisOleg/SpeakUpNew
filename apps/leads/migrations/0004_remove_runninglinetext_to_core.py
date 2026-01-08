# Generated manually for removing RunningLineText from leads (moved to core)

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0003_alter_triallesson_phone'),
        ('core', '0007_add_runninglinetext_from_leads'),  # Залежність від міграції в core
    ]

    operations = [
        migrations.DeleteModel(
            name='RunningLineText',
        ),
    ]

