import React, { useState, useEffect  } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '~/components/ui/collapsible';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

type User = {
  id: number;
  name: string;
};

type Comment = {
  id: string;
  content: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  comments: Comment[];
  author: User;
 
};

export default function PostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newComments, setNewComments] = useState<{ [postId: string]: string }>({}); // Estado para novos comentários
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado de carregamento
  const [postData, setPostData] = React.useState({ title: '', content: '' });
  const API_URL_POSTS = 'http://localhost:3000/posts'; // URL da API
  const API_URL_USERS = 'http://localhost:3000/users';
  const API_URL_GET_COMMENTS = 'http://localhost:3000/comments';
  const API_URL_POST_COMMENT = 'http://localhost:3000/comment';
  const API_URL_POST_POST = 'http://localhost:3000/post';


  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token !== null) {
        // Token encontrado
        console.log('Token:', token);
        return token;
      } else {
        // Token não encontrado
        console.log('Token não encontrado');
        return null;
      }
    } catch (error) {
      console.error('Erro ao recuperar o token', error);
      return null;
    }
  };
  
  // Função para buscar os posts da API
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
    
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await fetchPosts();
      setIsLoading(false);
    };

    initialize();

    const interval = setInterval(fetchPosts, 10000);

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, []);

  const handleComment = async (postId: string) => {
    setIsLoading(true);
    console.log('Comment data:', newComments[postId]?.trim());
    const token = await getToken();
    if(token)
    {
      try {
        const response = await fetch(API_URL_POST_COMMENT, {
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
          await AsyncStorage.setItem('authToken', dataRes.token);
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
  const handlePost = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await fetch(API_URL_POST_POST, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Isso garante que o cookie será enviado nas requisições
        body: JSON.stringify(postData),
      });
      const dataRes = await response.json();
      if (dataRes) 
      {
        await AsyncStorage.setItem('authToken', dataRes.token);
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
// Função de renderização para cada post
  const renderPost = ({ item }: { item: Post | null | undefined }) => {
    if (!item) {
      return <Text>Erro: Post não encontrado.</Text>;
    }
  
    return (
      <Card style={styles.postCard}>
        <CardHeader>
          <CardTitle>{item.author.name || 'Autor indisponível'}</CardTitle>
        </CardHeader>
        <CardTitle className='pb-2 text-center'>{item.title || 'Título indisponível'}</CardTitle>
        <CardContent>
          <Text>{item.content || 'Conteúdo indisponível'}</Text>
          <View style={styles.commentHeaderContainer}>
            <Text style={styles.commentHeader}>Comentários:</Text>
            <Text style={styles.instruction}>(Clique no comentário para mostrar os outros)</Text>
          </View>
  
          {item.comments?.length > 0 ? (
            <Collapsible>
              <CollapsibleTrigger>
                <Text style={styles.comment}>
                  - {item.comments[0]?.content || 'Comentário indisponível'}
                </Text>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {item.comments.slice(1).map((comment) => (
                  <Text key={comment.id} style={styles.comment}>
                    - {comment.content || 'Comentário indisponível'}
                  </Text>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Text style={styles.noComments}>Sem comentários ainda.</Text>
          )}
  
          <Input
            placeholder="Escreva um comentário..."
            value={newComments[item.id] || ''}
            onChangeText={(text) =>
              setNewComments((prevComments) => ({
                ...prevComments,
                [item.id]: text,
              }))
            }
            style={styles.input}
          />
          <Button
            style={styles.button}
            onPress={() => handleComment(item.id)}
          >
            <Text>Comentar</Text>
          </Button>
        </CardContent>
      </Card>
    );
  };
    

  return (
    <View style={styles.container}>
      {isLoading ? <p>Carregando...</p> : 
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
      />}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='outline'>
            <Text>Poste algo!</Text>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[750px]" >
          <DialogHeader>
            <DialogTitle>Digite seu post:</DialogTitle>
            <DialogDescription>
            <Label style = {{ marginTop: 8 }}>Título</Label>
              <Input
                style = {{ marginTop: 8 }}
                value={postData.title}
                onChangeText={(text) =>
                  setPostData((prev) => ({ ...prev, title: text }))
                }
                placeholder="Digite o título"
              />
              <Label style = {{ marginTop: 8 }}>Conteúdo</Label>
              <Input
                editable
                multiline={true}
                numberOfLines={4}
                style = {{ marginTop: 8, height: 120,}}
                value={postData.content}
                onChangeText={(text) =>
                  setPostData((prev) => ({ ...prev, content: text }))
                }
                placeholder="Digite o conteúdo"
                secureTextEntry
              />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
            <Button
              style={styles.buttonPost}
              onPress={handlePost}
            >
              <Text>Poste Algo!</Text>
            </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    paddingBottom: 16,
  },
  postCard: {
    marginBottom: 16,
  },
  commentHeader: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  comment: {
    marginTop: 8,
    paddingLeft: 8,
  },
  noComments: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#888',
  },
  button: {
    marginTop: 16,
    paddingLeft: 8,
    width: 300,
    alignSelf:'center',
  },
  buttonPost: {
    marginTop: 16,
    width: 200,
    alignSelf:'center',
  },
  input: {
    marginTop: 16,
    paddingLeft: 8,
  },
  instruction: {
    opacity: 0.3, 
    fontStyle: 'italic', 
    marginTop: 4, 
    paddingLeft: 8,
  },
  commentHeaderContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8,
  }
});
