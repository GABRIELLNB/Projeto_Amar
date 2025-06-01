from django.urls import path
from .views import (
    CadastroView,
    DisponibilidadesPorDataView,
    PreCadastroFuncionarioView,
    UsuarioListView, UsuarioDetailView,
    ProfissionalListView, ProfissionalDetailView,
    EstagiarioListView, EstagiarioDetailView,
    AgendamentoListCreateView, AgendamentoDetailView,
    AgendamentosPorDataView,
    listar_horarios_disponiveis
)

urlpatterns = [
    path('api/cadastro/', CadastroView.as_view(), name='cadastro'),
    path('api/cadastro-funcionario/', PreCadastroFuncionarioView.as_view(), name='cadastro-funcionario'),

    path('api/usuarios/', UsuarioListView.as_view(), name='usuarios-list'),
    path('api/usuarios/<pk>/', UsuarioDetailView.as_view(), name='usuario-detail'),

    path('api/profissionais/', ProfissionalListView.as_view(), name='profissionais-list'),
    path('api/profissionais/<pk>/', ProfissionalDetailView.as_view(), name='profissional-detail'),

    path('api/estagiarios/', EstagiarioListView.as_view(), name='estagiarios-list'),
    path('api/estagiarios/<pk>/', EstagiarioDetailView.as_view(), name='estagiario-detail'),

    path('api/agendamentos/', AgendamentoListCreateView.as_view(), name='agendamento-list-create'),
    path('api/agendamentos/<int:pk>/', AgendamentoDetailView.as_view(), name='agendamento-detail'),
    path('api/agendamentos-por-data/<str:data>/', AgendamentosPorDataView.as_view(), name='agendamentos-por-data'),
    path('horarios-disponiveis/', listar_horarios_disponiveis, name='horarios-disponiveis'),
     path('api/disponibilidades-por-data/<str:data>/', DisponibilidadesPorDataView.as_view(), name='horarios-disponiveis-por-data'),

    #path('api/Login/', LoginView.as_view(), name='Login'),
    #path('api/Menu/', MenuView.as_view(), name='Menu'),
    #path('api/Editar Perfil',EditarPerfilView.as_view(), name='Editar Perfil'),
    #path('api/Forums', ForumDetaiView.as_view(), name= 'forums'),
    
]