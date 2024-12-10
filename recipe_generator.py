from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def generate_recipe_auto(ingredients):

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.5,
        timeout=None,
        max_retries=2,
    )
    
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a world-class chef. Using the following ingredients, create a detailed recipe. "
                "The recipe should have clear, step-by-step instructions."
            ),
            ("human", "{recipe_auto}"),
        ]
    )

    chain = prompt | llm | StrOutputParser()

    return chain.invoke({"recipe_auto": ", ".join(ingredients)})


def generate_recipe_custom(ingredients, cuisine, servings, flavor):

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.5,
        timeout=None,
        max_retries=2,
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a world-class chef. Create a detailed recipe based on the provided ingredients and preferences. "
                "The recipe must have step-by-step instructions."
            ),
            (
                "human",
                "Ingredients: {ingredients}\n"
                "Cuisine: {cuisine}\n"
                "Serving Size: {servings}\n"
                "Flavor: {flavor}"
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()

    return chain.invoke(
        {
            "ingredients": ", ".join(ingredients),
            "cuisine": cuisine,
            "servings": servings,
            "flavor": flavor,
        }
    )
