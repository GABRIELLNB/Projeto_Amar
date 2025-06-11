from django.contrib import admin
from .models import Agendamento, Disponibilidade, ForumCurtida, Forums, MensagemForum, Usuario, Profissional, Estagiario
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

# Registrar o modelo de usuário personalizado
admin.site.register(Usuario)

# Admin de Profissional com nome e e-mail do usuário
class ProfissionalAdmin(admin.ModelAdmin):
    list_display = ('cpf', 'get_nome_usuario', 'get_email_usuario')

    def get_nome_usuario(self, obj):
        return obj.usuario.nome if obj.usuario else "(Sem usuário)"
    get_nome_usuario.short_description = 'Nome do Usuário'

    def get_email_usuario(self, obj):
        return obj.usuario.email if obj.usuario else "(Sem e-mail)"
    get_email_usuario.short_description = 'E-mail do Usuário'

# Admin de Estagiário com nome e e-mail do usuário
class EstagiarioAdmin(admin.ModelAdmin):
    list_display = ('cpf', 'get_nome_usuario', 'get_email_usuario')

    def get_nome_usuario(self, obj):
        return obj.usuario.nome if obj.usuario else "(Sem usuário)"
    get_nome_usuario.short_description = 'Nome do Usuário'

    def get_email_usuario(self, obj):
        return obj.usuario.email if obj.usuario else "(Sem e-mail)"
    get_email_usuario.short_description = 'E-mail do Usuário'

# Registrar admins personalizados
admin.site.register(Profissional, ProfissionalAdmin)
admin.site.register(Estagiario, EstagiarioAdmin)
admin.site.register(Agendamento)
admin.site.register(Disponibilidade)
admin.site.register(Forums)
admin.site.register(MensagemForum)
admin.site.register(ForumCurtida)

