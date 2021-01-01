# Start from a Debian image with the latest version of Go installed
# and a workspace (GOPATH) configured at /go.
FROM golang

# Copy the local package files to the container's workspace
ADD . /go/src/hardorange/fitness
WORKDIR /go/src/hardorange/fitness

# Build the fitness command inside the container.
RUN go get /go/src/hardorange/fitness
RUN go install /go/src/hardorange/fitness

# Run the fitness
ENTRYPOINT /go/bin/fitness