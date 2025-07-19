let animalRunning = false;
let animalIndex = 0;

const animals = [
   '/assets/animals/bunny.gif',
  '/assets/animals/cat.gif',
  
  '/assets/animals/rhino.gif',
   '/assets/animals/onlybubbles.gif',
 
  '/assets/animals/bird.gif'
];

function spawnAnimal(src) {
  if (animalRunning) return;
  animalRunning = true;

  const animal = document.createElement('img');
  animal.src = src;
  animal.classList.add('animal');

  // Start at a random vertical position
  const top = Math.random() * (window.innerHeight - 700);
  animal.style.position = 'fixed';
  animal.style.top = `${top}px`; // ✅ FIXED: was screenTop (undefined)
  animal.style.left = '-100px';
  animal.style.width = '100px';
  animal.style.zIndex = '9999';
  animal.style.transition = 'left 20s linear';

  document.getElementById('animatedAnimals').appendChild(animal);

  // Start animation
  setTimeout(() => {
    animal.style.left = '100vw';
  }, 100); // small delay to trigger transition

  // Clean up after animation
  setTimeout(() => {
    animal.remove();
    animalRunning = false;
    cycleNextAnimal(); // start next one
  }, 15000); // match transition duration
}

function cycleNextAnimal() {
  const currentAnimal = animals[animalIndex];
  animalIndex = (animalIndex + 1) % animals.length;
  spawnAnimal(currentAnimal); // ✅ FIXED: was using randomAnimal
}

// Start animation cycle after page load
window.addEventListener('load', () => {
  cycleNextAnimal();
});
