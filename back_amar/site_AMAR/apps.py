from django.apps import AppConfig

class SiteAmarConfig(AppConfig):
    name = 'site_AMAR'

    def ready(self):
        import site_AMAR.signals
