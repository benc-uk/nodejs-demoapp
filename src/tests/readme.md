### 🧪 Testing

This project uses HTTP files located in `src/tests/` that can be used a few different ways, you can install the [VSCode REST CLient](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) or [httpYac](https://marketplace.visualstudio.com/items?itemName=anweber.vscode-httpyac), [httpYac](https://httpyac.github.io/) is preferred as it supports many more features.

You can interactively run & send the requests in the `src/tests` file using these extensions, but the main reason to use _httpYac_, is it has a much richer language & the support of assertions which can turn the request files into integration tests too 👌

For example

```http
GET http://localhost:8000/info

?? status == 200
?? body contains Memory
```

_httpYac_ has a command line tool for running tests and .http files which forms the basis of the `make test` and `make test-report` makefile targets. It also natively supports .env files, so will load variables from a .env file if one is found.
