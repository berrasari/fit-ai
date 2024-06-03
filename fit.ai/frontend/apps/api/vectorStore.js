const { createClient } = require("@supabase/supabase-js");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { Document } = require("langchain/document");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

const splitTextIntoChunks = (text, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

const fetchArticlesAndCreateVectorStore = async () => {
  try {
    const { data, error } = await supabase.from("articles").select("text");
    if (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
    if (!data || data.length === 0) {
      console.warn("No articles found in the database.");
      return null;
    }

    const documents = data.flatMap((article) =>
      splitTextIntoChunks(article.text, 1000).map(
        (chunk) => new Document({ pageContent: chunk })
      )
    );

    const embeddings = new OpenAIEmbeddings();
    const vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addDocuments(documents);

    return vectorStore;
  } catch (error) {
    console.error("Error creating vector store:", error);
    throw error;
  }
};

module.exports = { fetchArticlesAndCreateVectorStore };
