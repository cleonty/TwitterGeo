FROM golang:1.13

WORKDIR /go/src/app
COPY . .

RUN go-wrapper download   # "go get -d -v ./..."
RUN go-wrapper install    # "go install -v ./..."

EXPOSE 8383

CMD ["go-wrapper", "run"] # ["app"]