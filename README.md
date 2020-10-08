# Angular Guacamole Client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.1.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Installation

1. [guacamole/guacd](https://hub.docker.com/r/guacamole/guacd). Docker image is a better way for adding it to a developing environment

1.1 [Install Docker](https://www.docker.com/get-started)

1.2 Pull guacd image `docker pull guacamole/guacd`

1.3 Running guacd `docker run --name some-guacd -d -p 4822:4822 guacamole/guacd`

2. web-sockets⇄guacd proxy - [guacamole-test-server](https://github.com/jamhall/guacamole-test-server)

2.1 [Download guacamole-test-server](https://github.com/jamhall/guacamole-test-server)

2.2 Download and install [Maven](http://maven.apache.org/download.cgi)

2.3 Download and install [JDK](https://www.oracle.com/java/technologies/javase-jdk15-downloads.html)

2.4 Run `mvn package`

2.5 Run `java -jar target/gts.jar --guacd-host n.n.n.n --guacd-port 4822 --port 8080`
    n.n.n.n is ip address of your guacamole/guacd, probably it will be an ip address of your local network interface e.g. 192.168.1.55

3. I had second computer with windows 7 in my local network. I used it as rdp server.

4. Edit src\app\shared\component\remote-desktop\remote-desktop.component.ts with right parameters of ip address: see line 26

5. Run `npm install`

6. Run `npm run start`
