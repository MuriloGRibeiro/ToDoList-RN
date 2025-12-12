import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  Keyboard,
  Platform 
} from 'react-native';

import { Feather, MaterialIcons } from '@expo/vector-icons'; 

const colors = {
  background: '#F5F0E6',     
  primary: '#5D4037',        
  textDark: '#3E2723',       
  textLight: '#8D6E63',      
  textDone: '#A1887F',       
  cardBackground: '#FFFFFF', 
  border: '#D7CCC8',         
  success: '#558B2F',        
  danger: '#D84315',         
  dangerBg: '#FBE9E7',       
  doneBg: '#EFEBE9',
  editIcon: '#1976D2',
};

export default function App() {
  const [tarefaAtual, setTarefaAtual] = useState('');
  const [dataPrazo, setDataPrazo] = useState('');
  const [listaTarefas, setListaTarefas] = useState([]);
  const [idEditando, setIdEditando] = useState(null);

  function verificaAtraso(dataString) {
    if (!dataString) return false; 
    const partes = dataString.split('/');
    if (partes.length !== 3) return false;
    const dataDoPrazo = new Date(partes[2], partes[1] - 1, partes[0]);
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    return dataDoPrazo < hoje;
  }

  function salvarTarefa() {
    if (tarefaAtual.trim() === '') {
      exibirAlerta('Erro', 'Digite o nome da tarefa!');
      return;
    }
    if (dataPrazo.trim() === '') {
      exibirAlerta('Data Obrigatória', 'Informe a data (DD/MM/AAAA).');
      return;
    }
    if (dataPrazo.length !== 10) {
      exibirAlerta('Data Inválida', 'Use o formato DD/MM/AAAA.');
      return;
    }

    if (idEditando !== null) {
      const novaLista = listaTarefas.map(item => {
        if (item.id === idEditando) {
          return { ...item, texto: tarefaAtual, data: dataPrazo };
        }
        return item;
      });
      setListaTarefas(novaLista);
      setIdEditando(null); 
    } else {
      const novaTarefa = {
        id: Date.now().toString(),
        texto: tarefaAtual,
        data: dataPrazo, 
        feita: false
      };
      setListaTarefas((listaAntiga) => [...listaAntiga, novaTarefa]);
    }

    setTarefaAtual('');
    setDataPrazo(''); 
    if (Platform.OS !== 'web') Keyboard.dismiss();
  }

  function editarTarefa(item) {
    setTarefaAtual(item.texto);
    setDataPrazo(item.data);
    setIdEditando(item.id); 
  }

  function cancelarEdicao() {
    setTarefaAtual('');
    setDataPrazo('');
    setIdEditando(null);
    Keyboard.dismiss();
  }

  function excluirTarefa(id) {
    if (Platform.OS === 'web') {
      if (confirm("Deseja realmente excluir esta tarefa?")) {
        if (id === idEditando) cancelarEdicao();
        setListaTarefas(lista => lista.filter(item => item.id !== id));
      }
    } else {
      Alert.alert("Excluir", "Deseja realmente excluir?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim", onPress: () => {
            if (id === idEditando) cancelarEdicao();
            setListaTarefas(lista => lista.filter(item => item.id !== id));
        }}
      ]);
    }
  }

  function exibirAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  function marcarComoFeita(id) {
    const novaLista = listaTarefas.map(item => {
      if (item.id === id) return { ...item, feita: !item.feita };
      return item;
    });
    setListaTarefas(novaLista);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>ToDoList</Text>

      <View style={styles.inputContainer}>
        
       
        <TextInput
          style={styles.inputTexto}
          placeholder="ToDoList"
          placeholderTextColor={colors.textLight}
          value={tarefaAtual}
          onChangeText={setTarefaAtual}
        />
        
        
        <TextInput
            style={styles.inputData}
            placeholder="Data"
            placeholderTextColor={colors.textLight}
            value={dataPrazo}
            onChangeText={setDataPrazo}
            maxLength={10}
            keyboardType="numeric"
        />

        <TouchableOpacity 
          style={[styles.botaoAdd, idEditando ? styles.botaoEditando : null]} 
          onPress={salvarTarefa}
        >
          <Feather name={idEditando ? "check" : "plus"} size={24} color="#FFF" />
        </TouchableOpacity>

        {idEditando && (
          <TouchableOpacity style={styles.botaoCancelar} onPress={cancelarEdicao}>
              <Feather name="x" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={listaTarefas}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.textoVazio}>Nenhuma tarefa cadastrada.</Text>}
        renderItem={({ item }) => {
          const estaAtrasada = !item.feita && verificaAtraso(item.data);

          return (
            <View 
              style={[
                styles.item, 
                item.feita ? styles.itemFeita : null,
                estaAtrasada ? styles.itemAtrasado : null,
                idEditando === item.id ? styles.itemSendoEditado : null
              ]}
            >
              <TouchableOpacity 
                style={styles.infoTarefa} 
                onPress={() => marcarComoFeita(item.id)}
              >
                <Text style={[styles.textoItem, item.feita ? styles.textoFeito : null]}>
                  {item.texto}
                </Text>
                {item.data ? (
                  <Text style={[styles.textoData, estaAtrasada ? styles.textoAtrasado : null]}>
                    📅 {item.data} {estaAtrasada ? '(Atrasado!)' : ''}
                  </Text>
                ) : null}
              </TouchableOpacity>

              <View style={styles.acoesContainer}>
                <Text style={{marginRight: 5}}>
                   {item.feita ? '✅' : (estaAtrasada ? '⚠️' : '⏳')}
                </Text>

                <TouchableOpacity onPress={() => editarTarefa(item)} style={styles.acaoBtn}>
                  <Feather name="edit-2" size={20} color={colors.editIcon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => excluirTarefa(item.id)} style={styles.acaoBtn}>
                  <MaterialIcons name="delete-outline" size={24} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row', 
    marginBottom: 20,
    alignItems: 'center',
    gap: 8, 
  },
  inputTexto: {
    flex: 1, 
    backgroundColor: colors.cardBackground,
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textDark,
  },
  inputData: {
    backgroundColor: colors.cardBackground,
    height: 45,
  
    width: 125, 
    borderRadius: 8,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    color: colors.textDark,
    fontSize: 14, 
  },
  botaoAdd: {
    width: 45,
    height: 45,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  botaoEditando: {
    backgroundColor: colors.success,
  },
  botaoCancelar: {
    width: 45,
    height: 45,
    backgroundColor: colors.textLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: colors.cardBackground,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  itemSendoEditado: {
    borderColor: colors.editIcon,
    borderWidth: 1, 
  },
  itemFeita: {
    backgroundColor: colors.doneBg,
    opacity: 0.9,
    borderLeftColor: colors.success
  },
  itemAtrasado: {
    borderLeftColor: colors.danger,
    backgroundColor: colors.dangerBg
  },
  infoTarefa: {
    flex: 1, 
  },
  acoesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5 
  },
  acaoBtn: {
    padding: 5, 
  },
  textoItem: {
    fontSize: 16,
    color: colors.textDark,
    fontWeight: '600'
  },
  textoData: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4
  },
  textoAtrasado: {
    color: colors.danger,
    fontWeight: 'bold'
  },
  textoFeito: {
    textDecorationLine: 'line-through',
    color: colors.textDone,
  },
  textoVazio: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 20,
  }
});