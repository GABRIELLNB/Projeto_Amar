import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from .models import User
from django.contrib.auth.hashers import check_password

@csrf_exempt  #apenas para teste tirar antes de aprtesentar

def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            cpf = data.get('cpf')
            senha = data.get('senha')

            if not cpf or not senha:
                return JsonResponse({'erro': 'CPF e senha são obrigatórios.'}, status=400)

            try:
                usuario = User.objects.get(cpf=cpf)
                if check_password(senha, usuario.senha):
                    return JsonResponse({
                        'mensagem': 'Login bem-sucedido!',
                        'nome': usuario.nome,
                        'cpf': usuario.cpf,
                        'user_id': usuario.id,
                    }, status=200)
                else:
                    return JsonResponse({'erro': 'Senha incorreta.'}, status=401)
            except User.DoesNotExist:
                return JsonResponse({'erro': 'Usuário não encontrado.'}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({'erro': 'JSON inválido.'}, status=400)

    return JsonResponse({'erro': 'Método não permitido.'}, status=405)



@csrf_exempt #apenas para teste tirar antes de aprtesentar

def cadastro(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            cpf = data.get('cpf')
            nome = data.get('nome')
            email = data.get('email')
            telefone = data.get('telefone')
            senha = data.get('senha')

            #verificação
            if not all([cpf, nome, email, telefone, senha]):
                return JsonResponse({'erro': 'Todos os campos são obrigatórios.'}, status=400)#VAI SAIR
            
            if User.objects.filter(cpf=cpf).exists():
                return JsonResponse({'erro': 'CPF já cadastrado.'}, status=400)#VAI SAIR
            
            if User.objects.filter(email=email).exists():
                    return JsonResponse({'erro': 'Email já cadastrado.'}, status=400)#VAI SAIR
            
            senha_criptografada = make_password(senha)

            User.objects.create(
                cpf=cpf,
                nome=nome,
                email=email,
                telefone=telefone,
                senha=senha_criptografada,
            )

            return JsonResponse({'mensagem': 'Cadastro realizado com sucesso!'}, status=201)#VAI SAIR
        
        except json.JSONDecodeError:
                return JsonResponse({'erro': 'JSON inválido.'}, status=400)#VAI SAIR

    return JsonResponse({'erro': 'Método não permitido.'}, status=405)#VAI SAIR




