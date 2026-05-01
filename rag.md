# Retrival augmented generation

# suppose we have lager number of files like 500GB and we want to train our own AI using these documents 

# first human lang convert into numerical representaion

# but whenever qeries anything they need to preocess entire 500gb documentation every time to fetch the result, that's quite efficient 

# that's why we essentially store the documents by preserving the semantics which means menaing of those words into vector embedding means embed all data into vector forms and then store into db as vectors which is called vector db

# due to this method AI can retrive data faster by splitting the data into chunks via vectordb

# This above method is called RAG

# in this method instead of searching static sentences the meaning and context of the query is use to match against the existing document

# Augmentaion in RAG refers to the process where the retrive data is injected into the prompt into the runtime

# final step od RAG is generation, in this step ai assistant generates the response given the semantic relevant data retrieved from the database 

# we have chunking strategy before dividing data into chunks for vector embedding 

Chunking strategy matters because different document types have unique structures and contexts. For example, legal documents need larger chunks to preserve clause relationships, while conversational texts may benefit from smaller chunks for precise retrieval.


Chunk size and overlap directly impact retrieval accuracy. Larger chunks risk irrelevant data, while smaller chunks might lose context. Overlap helps bridge gaps.

-> Embbeding strategy
-> Retrievel strategy
-> Chunking strategy


# Legal documents require diff chunking strategies becoz legal document often have long structured paragraph that needs to be preserved. 

# while converstional transcript can be just fine with sentence level chunking with high overlap to preserve context