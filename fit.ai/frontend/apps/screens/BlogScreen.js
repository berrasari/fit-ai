import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { theme } from "../core/theme";
import Markdown from "react-native-markdown-display";
import { supabase } from "../api/supabase"; // Adjust this path to where your Supabase client is configured
import Background from "../components/Background";
import { getStatusBarHeight } from "react-native-status-bar-height";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const SkeletonCard = () => (
  <SkeletonPlaceholder>
    <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
      <SkeletonPlaceholder.Item
        width={325}
        height={600}
        borderRadius={25}
        marginHorizontal={10}
      />
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
);

const BlogScreen = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase
      .from("blog")
      .select("id, created_at, title, post, image_url")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setBlogPosts(data);
    }
    setLoading(false);
  };

  const handlePress = (post) => {
    setSelectedPost(post);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handlePress(item)}>
        <View style={styles.card}>
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            onLoadEnd={() => setImageLoading(false)}
          />

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.createdAt}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {selectedPost ? (
        <View style={{ borderRadius: 40 }}>
          <ImageBackground
            source={{ uri: selectedPost.image_url }}
            style={styles.postImageimage}
            imageStyle={{ borderRadius: 40 }}
          >
            <TouchableOpacity onPress={() => setSelectedPost(null)}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
          </ImageBackground>
          <ScrollView style={styles.postContainer}>
            <Text style={styles.postTitle}>{selectedPost.title}</Text>
            <Text style={styles.createdAt}>
              {formatDate(selectedPost.created_at)}
            </Text>
            <Markdown style={styles.markdown}>{selectedPost.post}</Markdown>
          </ScrollView>
        </View>
      ) : (
        <Background>
          <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Blog</Text>
            <Text style={styles.welcomeDescription}>
              Explore your interests based on the wellness.
            </Text>
            {loading && imageLoading ? (
              <FlatList
                data={[...Array(5).keys()]} // Placeholder array for skeletons
                renderItem={() => <SkeletonCard />}
                keyExtractor={(item) => item.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <FlatList
                data={blogPosts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </SafeAreaView>
        </Background>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.0)",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  heading: {
    marginTop: 70,
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
    textAlign: "center",
  },
  welcomeDescription: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.colors.gray,
    textAlign: "center",
  },
  createdAt: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.colors.gray,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    borderColor: "lightgray",
    borderWidth: 0.25,
    marginRight: 20,
    width: 325,
    height: 600,
    justifyContent: "start",
    alignItems: "center",
    shadowOffset: { width: 3, height: 2 },
    shadowColor: "black",
    shadowOpacity: 0.9,
  },
  postImageimage: {
    zIndex: 800,
    top: 0,
    width: "100%",
    height: 350,
    objectFit: "cover",
    borderRadius: 40,
    shadowOffset: { width: 3, height: 2 },
    shadowColor: "black",
    shadowOpacity: 0.3,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  image: {
    top: 0,
    width: 325,
    height: 350,
    objectFit: "cover",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: theme.colors.gray,
    fontSize: 32,
    fontWeight: "bold",
    margin: 10,
    paddingVertical: 10,
    textAlign: "center",
    shadowOffset: { width: 3, height: 5 },
    shadowColor: theme.colors.gray,
    shadowOpacity: 0.1,
    height: 200,
    maxWidth: 300,
  },
  postTitle: {
    color: "black",
    fontSize: 32,
    fontWeight: "bold",
    marginHorizontal: 10,
    paddingVertical: 10,
    textAlign: "center",
    shadowOffset: { width: 3, height: 5 },
    shadowColor: theme.colors.gray,
    shadowOpacity: 0.1,
  },
  postContainer: {
    height: "60%",
    marginHorizontal: 25,
    paddingBottom: 150,
  }, // Added extra padding to the bottom
  backButton: {
    fontSize: 36,
    color: "black",
    fontWeight: "semibold",
    marginBottom: 20,
    position: "absolute",
    top: 40 + getStatusBarHeight(),
    left: 20,
    zIndex: 1000,
  },
  skeletonCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    borderColor: "lightgray",
    borderWidth: 0.25,
    marginRight: 20,
    width: 325,
    height: 600,
    justifyContent: "start",
    alignItems: "center",
    shadowOffset: { width: 3, height: 2 },
    shadowColor: "black",
    shadowOpacity: 0.9,
  },
  markdown: {
    fontSize: 24,
    margin: 10,
    color: "black",
  },
  listContent: {
    alignItems: "start",
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "black",
    shadowOpacity: 0.2,
  },
});

export default BlogScreen;
