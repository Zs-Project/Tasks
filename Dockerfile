FROM python:3.12-slim

WORKDIR /app

COPY . /app

ENV PORT=4173
ENV PLANBOARD_HOST=0.0.0.0

EXPOSE 4173

CMD ["python", "server.py"]
