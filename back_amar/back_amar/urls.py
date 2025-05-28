"""
URL configuration for back_amar project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('Login/',views.login, name= 'login'),
    path('cadastro/',views.cadastro, name='cadastro'),
    path('Menu/', admin.site.urls),
    path('Editar_Perfil/', admin.site.urls),
    path('Bate_papo/', admin.site.urls),
    path('Agendamento/', admin.site.urls),
    path('Historico/', admin.site.urls),
    path('Configuracoes/', admin.site.urls),
    #path('Consultas/', admin.site.urls),
    #path('Permissões/', admin.site.urls),
    #path('Entenda_Mais/', admin.site.urls),
    #path('Termos_e_politicas/', admin.site.urls),
    #path('Permissoes/', admin.site.urls),
    #path('Sair_da_conta/', admin.site.urls),
]
