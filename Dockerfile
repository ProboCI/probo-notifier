# ProboCI
# https://www.probo.ci

FROM node:12

RUN useradd --user-group --create-home --shell /bin/false probo
RUN mkdir -p /home/probo/app
COPY . /home/probo/app
RUN chown -R probo:probo /home/probo/app

USER probo
RUN cd /home/probo/app/ && npm install

WORKDIR /home/probo/app

EXPOSE 3039

CMD ["sh", "/home/probo/app/bin/startup.sh"]
