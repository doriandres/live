# Live

Utility to handle simple observable values in JS/TS apps


## Using a Live value to create a binding
``` ts
const name = Live.for("Mark"); // create simple live value for a string
const person = { name: "" }; // this will be the object we want to keep updated
const human = { givenName: "" }; // this will be the object we want to keep updated

Bind.for(person, "name", name); // bind 'person' object 'name' property to live value
Bind.for(human, "givenName", name); // bind 'human' object 'givenName' property to live value

console.log(person.name);  // Mark
console.log(human.givenName);  // Mark

name.value = "Frank"; // apply updates on live value

console.log(person.name); // Frank
console.log(human.givenName); // Frank
```

## Using a Pipe to extend upstream Live values
``` ts
const name = Live.for("Mark"); // create simple live value for a string
const person = { name: "" }; // this will be the object we want to keep updated

Bind.for(person, "name", Pipe.from(name, v => v + " Lee")); // bind 'person' object 'name' property to piped live value

console.log(person.name);  // Mark Lee

name.value = "Frank"; // apply updates on live value

console.log(person.name); // Frank Lee
```

## Using a Spy on non live values to create a binding
```ts
const jim = { lastname: "Halpert" };
const pam = { surname: "Beesley" };

Bind.for(pam, "surname", Spy.on(jim, "lastname"));

console.log(pam.surname); // Halpert

jim.lastName = "Carrey";

console.log(pam.surname); // Carrey
```

