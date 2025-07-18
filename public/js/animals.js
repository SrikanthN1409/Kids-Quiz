function spawnAnimal(src) {
  const animal = document.createElement('img');
  animal.src = src;
  animal.classList.add('animal');

  // Start at a random vertical position
  const top = Math.random() * (window.innerHeight - 900);
  animal.style.top = `${screenTop}px`;

  // Random delay to stagger animations
  animal.style.animationDelay = `${Math.random() * 5}s`;

  document.getElementById('animatedAnimals').appendChild(animal);

  // Remove after animation ends
  setTimeout(() => animal.remove(), 20000);
}

// Cycle animals every few seconds
setInterval(() => {
  const animals = [
    // '/assets/animals/bunny.gif',
    // '/assets/animals/bear.gif',
    // '/assets/animals/cat.gif',
    // '/assets/animals/dog.gif',
    '/assets/animals/rhino.gif'
    // '/assets/animals/onlybubbles.gif'
    //  '/assets/animals/pawsum.gif'
  ];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  spawnAnimal(randomAnimal);
}, 3000); // every 3 seconds
