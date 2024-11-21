# Trabalho de Programação Avançada para WEB

Feito usando https://github.com/mrzachnugent/react-native-reusables

## Conexões com o Servidor:

### Login:
```ts
    const handleLogin = async () => {
      console.log('Login data:', loginData);
      try {
        const response = await fetch('http://localhost:3000/auth/signin', {  // Toda essa const response é uma tentativa de enviar um POST para o servidor http://localhost:3000/auth/signin, tentando logar o usuário
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',                                            // Isso garante que o cookie será enviado nas requisições
          body: JSON.stringify(loginData),
        });
        if (!response.ok) {                                            // Checando se o login deu certo
          throw new Error('Erro na autenticação');
        }
        const data = await response.json();
          if (response.ok && data.token) {
            await AsyncStorage.setItem('authToken', data.token);   // Armazenando o token de forma  AsyncStorage.
            console.log('Login successful:', data);
            router.push('/postScreen');                            // Navega para a próxima tela após sucesso // Passando para a tela depois de logado
            
          }
          else
          {
            console.log(document.cookie);
            console.log("Deu Ruim!")
            console.log(data)
            console.log(response)
          }
      } catch (error) {
        console.error('Erro ao realizar login:', error);
      }
    };
```
### Registro:
```ts
    const handleRegister = async () => { // Toda essa const response é uma tentativa de enviar um POST para o servidor http://localhost:3000/auth/signup, tentando registrar o usuário no nosso servidor.
      console.log('Register data:', registerData);
      try {
        const response = await fetch('http://localhost:3000/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registerData),
        });
        if (!response.ok) {                                            // Checando se o registro deu certo
          throw new Error('Erro ao registrar');
        }
        const data = await response.json();
        console.log('Registro bem-sucedido:', data);
      } catch (error) {
        console.error('Erro ao realizar o registro:', error);
      }
    };
```

### Listando os posts, comentários e usuários:
```ts
  const API_URL_POSTS = 'http://localhost:3000/posts'; // URL da API
  const API_URL_USERS = 'http://localhost:3000/users';
  const API_URL_GET_COMMENTS = 'http://localhost:3000/comments';
  const fetchPosts = async () => {
    try {
      console.log("passou aqyu")
      // Fazer requisição para buscar os posts
      const postsResponse = await fetch(API_URL_POSTS);
      if (!postsResponse.ok) throw new Error('Erro ao buscar posts');
      const postsData = await postsResponse.json();
  
      // Fazer requisição para buscar os usuários
      const usersResponse = await fetch(API_URL_USERS);
      if (!usersResponse.ok) throw new Error('Erro ao buscar usuários');
      const usersData: User[] = await usersResponse.json();

      const commentsResponse = await fetch(API_URL_GET_COMMENTS);
      if (!commentsResponse.ok) throw new Error('Erro ao buscar comentários');
      const commentsData: User[] = await commentsResponse.json();

      // Criar um mapa para facilitar a associação pelo ID do comentário
      const commentsMap = new Map(commentsData.map(comment => [comment.id, comment]));

      // Criar um mapa para facilitar a associação pelo ID do autor
      const usersMap = new Map(usersData.map(user => [user.id, user]));
      // Mapear posts com o autor correto
      const formattedPosts = postsData.map((post: any) => ({
        ...post,
        author: usersMap.get(post.authorId) || { id: 0, name: 'Autor desconhecido' },
        comments: Array.from(commentsMap.values()).filter((comment: any) => comment.postId === post.id)
      }));

      console.log(formattedPosts);
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Erro ao buscar os posts:', error);
      Alert.alert('Erro', 'Não foi possível carregar os posts.');
    }
  };
```
### Fazendo comentários:
```ts
const API_URL_POST_COMMENT = 'http://localhost:3000/comment';
const handleComment = async (postId: string) => {
    setIsLoading(true);
    console.log('Comment data:', newComments[postId]?.trim());
    const token = await getToken();
    if(token)
    {
      try {
        const response = await fetch(API_URL_POST_COMMENT, {  // Tentatva de ralizar um POST para comment
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newComments[postId]?.trim(), postId })
        });
        const dataRes = await response.json();
        if (dataRes) 
        {
          await AsyncStorage.setItem('authToken', dataRes.token);     // Atualizando o token de autenticação
        }
        else
        {
          throw new Error('Erro na autenticação');
        }
      } catch (error) {
        console.error('Erro ao postar comentario:', error);
      }finally {
        setIsLoading(false);
      }  
    }
  };
```
### Fazendo pots:
```ts
const API_URL_POST_POST = 'http://localhost:3000/post';
const handlePost = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await fetch(API_URL_POST_POST, {  // Tentatva de ralizar um POST para post
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Isso garante que o cookie será enviado nas requisições, mas desisti de usar cookies e dixei apenas token  para demonstração.
        body: JSON.stringify(postData),
      });
      const dataRes = await response.json();
      if (dataRes) 
      {
        await AsyncStorage.setItem('authToken', dataRes.token);     // Atualizando o token de autenticação
      }
      else
      {
        throw new Error('Erro na autenticação');
      }
    } catch (error) {
      console.error('Erro ao postar post:', error);
    }finally {
      setIsLoading(false);
    }  
  };
```
