import os
from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
)

# GOOGLE_API_KEY 는 환경변수로 설정해둔다.
# export GOOGLE_API_KEY="YOUR_KEY"
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("환경변수 GOOGLE_API_KEY 가 설정되어 있지 않습니다.")

# Gemini Chat 모델 (질문/답변)
chat_model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",  # 필요하면 다른 모델로 변경
    temperature=0.2,
)

# Gemini Embedding 모델 (벡터스토어용)
embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-2.0-flash-embedding",
)
