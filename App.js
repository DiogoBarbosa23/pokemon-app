import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, ActivityIndicator, StyleSheet } from "react-native";

export default function App() {
  const [pokemons, setPokemons] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  async function loadPokemons() {
    if (loading || allLoaded) return;

    setLoading(true);

    const url = `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length === 0) {
        setAllLoaded(true);
        return;
      }

      // Buscar detalhes (imagem)
      const detailed = await Promise.all(
        data.results.map(async (item) => {
          const resp = await fetch(item.url);
          const info = await resp.json();
          return {
            id: info.id,
            name: info.name,
            image: info.sprites.front_default
          };
        })
      );

      setPokemons((old) => [...old, ...detailed]);
      setOffset((old) => old + 20);

    } catch (error) {
      console.log("Erro:", error);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPokemons();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokédex</Text>

      <FlatList
        data={pokemons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.pokemonName}>{item.name}</Text>
          </View>
        )}
        onEndReached={() => loadPokemons()}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          loading && <ActivityIndicator size="large" style={{ margin: 20 }} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
  },
  pokemonName: {
    fontSize: 20,
    marginLeft: 20,
    textTransform: "capitalize",
    fontWeight: "bold",
  },
  image: {
    width: 60,
    height: 60,
  },
});
