function spawnAnimal(src) {
  const animal = document.createElement('img');
  animal.src = src;
  animal.classList.add('animal');

  // Start at a random vertical position
  const top = Math.random() * (window.innerHeight - 100);
  animal.style.top = `${top}px`;

  // Random delay to stagger animations
  animal.style.animationDelay = `${Math.random() * 5}s`;

  document.getElementById('animatedAnimals').appendChild(animal);

  // Remove after animation ends
  setTimeout(() => animal.remove(), 12000);
}

// Cycle animals every few seconds
setInterval(() => {
  const animals = [
    // '/assets/animals/bunny.gif',
    // '/assets/animals/bear.gif',
    // '/assets/animals/cat.gif',
    '/assets/animals/dog.gif',
    '/assets/animals/rhino.gif',
    '/assets/animals/pawsum.gif'
  ];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  spawnAnimal(randomAnimal);
}, 3000); // every 3 seconds
