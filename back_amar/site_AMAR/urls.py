from django.urls import path
from .views import (
    
    #BuscaGeralView,
    CadastroView,
    CancelarAgendamentoView,
    CurtirForumAPIView,
    DescurtirForumAPIView,
    DisponibilidadesPorDataView,
    ForumDetailAPIView,
    ForumsAPIView,
    MensagemForumAPIView,
    MensagemForumDetailAPIView,
    MensagemForumListAPIView,
    MinhasConsultasAPIView,
    PreCadastroFuncionarioView,
    UsuarioListView, UsuarioDetailView,
    ProfissionalListView, ProfissionalDetailView,
    EstagiarioListView, EstagiarioDetailView,
    AgendamentoListCreateView, AgendamentoDetailView,
    AgendamentosPorDataView,
    DisponibilidadesPorhorariosView,

)
from .views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api/cadastro/', CadastroView.as_view(), name='cadastro'),
    path('api/cadastro-funcionario/', PreCadastroFuncionarioView.as_view(), name='cadastro-funcionario'),
    path('api/precadastro/<str:tipo>/<str:cpf>/', PreCadastroFuncionarioView.as_view(), name='precadastro-funcionario'),


    path('api/usuarios/', UsuarioListView.as_view(), name='usuarios-list'),
    path('api/usuarios/<pk>/', UsuarioDetailView.as_view(), name='usuario-detail'),

    path('api/profissionais/', ProfissionalListView.as_view(), name='profissionais-list'),
    path('api/profissionais/<pk>/', ProfissionalDetailView.as_view(), name='profissional-detail'),

    path('api/estagiarios/', EstagiarioListView.as_view(), name='estagiarios-list'),
    path('api/estagiarios/<pk>/', EstagiarioDetailView.as_view(), name='estagiario-detail'),

    path('api/agendamentos/', AgendamentoListCreateView.as_view(), name='agendamento-list-create'),
    path('api/agendamentos/<int:pk>/', AgendamentoDetailView.as_view(), name='agendamento-detail'),
    path('api/agendamentos-por-data/<str:data>/', AgendamentosPorDataView.as_view(), name='agendamentos-por-data'),
    path('api/agendamentos/<int:pk>/cancelar/', CancelarAgendamentoView.as_view(), name='cancelar-agendamento'),
   
    path('api/disponibilidades-por-data/<str:data>/', DisponibilidadesPorDataView.as_view(), name='horarios-disponiveis-por-data'),
     path('api/agendamentos/minhas-consultas/', MinhasConsultasAPIView.as_view(), name='minhas-consultas'),
    path('api/disponibilidades-por-horario/<str:time>/', DisponibilidadesPorhorariosView.as_view(), name='horarios-disponiveis-por-horas'),

    path('api/forum/', ForumsAPIView.as_view(), name='forum-list-create'),
    path('api/forum/<int:pk>/', ForumDetailAPIView.as_view(), name='forum-detail'),
    path('api/forum/<int:pk>/curtir/', CurtirForumAPIView.as_view(), name='forum-curtir'),
    path('api/forum/<int:pk>/descurtir/', DescurtirForumAPIView.as_view(), name='forum-descurtir'),


    path('api/mensagem-forum/', MensagemForumAPIView.as_view(), name='mensagem-forum-list-create'),
    path('api/mensagem-forum/<int:pk>/', MensagemForumDetailAPIView.as_view(), name='mensagem-forum-detail'),
    path('api/mensagem-forum/forum/<int:forum_id>/', MensagemForumListAPIView.as_view(), name='mensagem-forum-list'),

    
    #path('api/Login/', LoginView.as_view(), name='Login'),
    #path('api/Menu/', MenuView.as_view(), name='Menu'),
    #path('api/Editar Perfil',EditarPerfilView.as_view(), name='Editar Perfil'),
    #path('api/Forums', ForumDetaiView.as_view(), name= 'forums'),
    
]