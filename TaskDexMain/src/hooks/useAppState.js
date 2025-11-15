import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, updateDoc, deleteField, runTransaction } from 'firebase/firestore';
import { app, db } from '../config/firebase.js';
import { getUserData, saveUserData, initializeUserData } from '../utils/storage.js';
import { getPokemonDataByName, getRandomWildPokemon, POKEMON_DATA } from '../data/pokemonData.js';

export function useAppState() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [screen, setScreen] = useState('WELCOME');
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [sessionConfig, setSessionConfig] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    if (!app) {
      // Firebase not available, use local storage
      const data = initializeUserData();
      setUserData(data);
      if (data.tasks) {
        setTasks(data.tasks);
      } else {
        setTasks([]);
      }
      setLoading(false);
      if (data.isProfileComplete) {
        setScreen('TASKS_SCREEN');
      } else {
        setScreen('STARTER_SELECT');
      }
      return;
    }

    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      setLoading(false);
      
      if (!currentUser) {
        setScreen('WELCOME');
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch/Subscribe to User Data from Firestore
  useEffect(() => {
    if (!user || !db || !authReady) {
      return;
    }

    const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', user.uid, 'profile', 'data');
    
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        // Load tasks from userData
        if (data.tasks) {
          setTasks(data.tasks);
        } else {
          setTasks([]);
        }
        
        // Auto-redirect based on profile completion
        if (screen === 'WELCOME' || screen === 'LOGIN_SIGNUP' || screen === 'STARTER_SELECT') {
          if (data.isProfileComplete) {
            setScreen('TASKS_SCREEN');
          } else {
            setScreen('STARTER_SELECT');
          }
        }
      } else {
        // User logged in but no data - will be created by AuthScreen
        setUserData(null);
        setTasks([]);
      }
    }, (error) => {
      console.error("Error fetching user data:", error);
    });

    return () => unsubscribe();
  }, [user, authReady, screen]);

  // Save new user (starter selection) - saves to both Firestore and localStorage
  const saveNewUser = useCallback(async (starterName, gender) => {
    const starterData = getPokemonDataByName(starterName);
    if (!starterData) return;

    const newPokedex = [{ id: starterData.id, name: starterName }];
    const newInventory = [{
      id: crypto.randomUUID(),
      pokedexId: starterData.id,
      name: starterName,
      type: starterData.type,
      exp: 0,
      stage: starterData.evoStage,
      currentName: starterName,
      isPartner: true,
    }];

    const profileData = {
      ...userData,
      trainerGender: gender,
      isProfileComplete: true,
      pokedex: newPokedex,
      pokemon_inventory: newInventory,
    };

    // Save to Firestore if user is logged in
    if (user && db) {
      try {
        const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', user.uid, 'profile', 'data');
        await setDoc(userDocRef, profileData, { merge: true });
      } catch (error) {
        console.error("Error saving to Firestore:", error);
      }
    }

    // Also save to localStorage as backup
    saveUserData(profileData);
    setUserData(profileData);
    setScreen('MAIN_MENU');
  }, [user, userData, db]);

  // Handle auth success
  const handleAuthSuccess = useCallback((firebaseUser) => {
    setUser(firebaseUser);
    // The onSnapshot listener will handle fetching user data and redirecting
  }, []);

  // Logout handler
  const handleLogout = useCallback(async () => {
    // Clear session storage so welcome message shows again on next login
    sessionStorage.removeItem('hasSeenWelcome');
    
    if (app) {
      try {
        const auth = getAuth(app);
        await signOut(auth);
        setScreen('WELCOME');
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  }, []);

  // Master Pokedex Unlock Function (with backup)
  const handleUnlockPokedex = useCallback(async () => {
    if (!user || !db || !userData) return;

    console.log("Unlocking Pokedex for selected types...");
    
    // 1. Get current partner ID BEFORE overwriting
    const currentPartner = userData.pokemon_inventory.find(p => p.isPartner);
    const currentPartnerId = currentPartner?.id;

    // 2. Define the backup
    const backup = {
      pokemon_inventory: userData.pokemon_inventory,
      pokedex: userData.pokedex
    };

    try {
      // 3. Create master lists, preserving existing pokemon data
      const allNames = new Set(POKEMON_DATA.list.map(p => p.name));
      const masterPokedex = [];
      const masterInventory = [];
      
      // Create a map of existing pokemon by pokedexId for quick lookup
      const existingPokemonMap = new Map();
      userData.pokemon_inventory.forEach(mon => {
        existingPokemonMap.set(mon.pokedexId, mon);
      });
      
      for (const name of allNames) {
        const p = getPokemonDataByName(name);
        
        // Add to Pokedex
        masterPokedex.push({ id: p.id, name: p.name });
        
        // Check if this pokemon already exists in inventory
        const existingMon = existingPokemonMap.get(p.id);
        
        if (existingMon) {
          // Preserve existing pokemon data (XP, stage, currentName, isPartner)
          masterInventory.push({
            id: existingMon.id, // Keep the same ID
            pokedexId: p.id,
            name: p.name,
            type: p.type,
            exp: existingMon.exp || 0, // Preserve XP
            stage: existingMon.stage !== undefined ? existingMon.stage : p.evoStage,
            currentName: existingMon.currentName || p.name, // Preserve evolved name
            isPartner: existingMon.isPartner || false // Preserve partner status
          });
        } else {
          // New pokemon - create fresh entry
          masterInventory.push({
            id: crypto.randomUUID(),
            pokedexId: p.id,
            name: p.name,
            type: p.type,
            exp: 0, 
            stage: p.evoStage,
            currentName: p.name,
            isPartner: false
          });
        }
      }

      // 4. Ensure partner is preserved (should already be preserved from above, but double-check)
      const partnerInNewInventory = masterInventory.find(p => p.isPartner);
      if (!partnerInNewInventory && currentPartnerId) {
        const oldPartnerData = userData.pokemon_inventory.find(p => p.id === currentPartnerId);
        if (oldPartnerData) {
          const newPartnerInstance = masterInventory.find(p => p.pokedexId === oldPartnerData.pokedexId);
          if (newPartnerInstance) {
            newPartnerInstance.isPartner = true;
          }
        }
      }

      // 5. Failsafe if partner wasn't found
      if (!masterInventory.find(p => p.isPartner) && masterInventory.length > 0) {
        // Default to the first Pokémon in the list (Bulbasaur)
        masterInventory[0].isPartner = true;
      }

      // 6. Write to Firestore: Overwrite data and save the backup
      const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', user.uid, 'profile', 'data');
      await updateDoc(userDocRef, {
        pokedex: masterPokedex.sort((a, b) => a.id - b.id),
        pokemon_inventory: masterInventory,
        original_progress_backup: backup // Save the backup
      });
      
      console.log("Master Pokedex Unlocked!");
      alert("Dev Mode ON: Pokédex Unlocked!");
    } catch (error) {
      console.error("Error unlocking pokedex:", error);
    }
  }, [user, userData, db]);

  // Revert Pokedex Function (Dev Mode OFF)
  const handleRevertPokedex = useCallback(async () => {
    if (!user || !db || !userData?.original_progress_backup) {
      alert("No backup to restore!");
      return;
    }

    console.log("Reverting to original progress...");
    try {
      const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', user.uid, 'profile', 'data');
      await updateDoc(userDocRef, {
        pokemon_inventory: userData.original_progress_backup.pokemon_inventory,
        pokedex: userData.original_progress_backup.pokedex,
        original_progress_backup: deleteField() // Delete the backup field
      });
      alert("Dev Mode OFF: Original progress restored.");
    } catch (error) {
      console.error("Error reverting pokedex:", error);
    }
  }, [user, userData, db]);

  // Set Partner Function
  const handleSetNewPartner = useCallback(async (newPartnerInstanceId) => {
    if (!user || !db || !userData) return;

    const newInventory = userData.pokemon_inventory.map(pokemon => {
      // Set the new partner
      if (pokemon.id === newPartnerInstanceId) {
        return { ...pokemon, isPartner: true };
      }
      // Unset the old partner
      return { ...pokemon, isPartner: false };
    });

    try {
      const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', user.uid, 'profile', 'data');
      await updateDoc(userDocRef, {
        pokemon_inventory: newInventory
      });
      setScreen('MAIN_MENU'); // Go back to main menu after selection
    } catch (error) {
      console.error("Error setting new partner:", error);
    }
  }, [user, userData, db, setScreen]);

  // Evolve Partner Function
  const handleEvolvePartner = useCallback(async (partnerInstanceId) => {
    if (!user || !db || !userData) return;

    const partner = userData.pokemon_inventory.find(p => p.id === partnerInstanceId);
    if (!partner) return;

    const evoData = getPokemonDataByName(partner.currentName);
    if (!evoData || evoData.evoExp === -1 || partner.exp < evoData.evoExp) {
      alert("This Pokémon is not ready to evolve!");
      return;
    }
    
    // Handle split evolutions (like Poliwhirl) by just picking the first one for now
    const nextMonName = Array.isArray(evoData.nextEvo) ? evoData.nextEvo[0] : evoData.nextEvo;
    const nextMonData = getPokemonDataByName(nextMonName);
    
    if (!nextMonData) {
      console.error("Could not find evolution data for", nextMonName);
      return;
    }
    
    // Check if the evolved form already exists in the inventory
    const existingEvoIndex = userData.pokemon_inventory.findIndex(
      p => p.pokedexId === nextMonData.id && !p.isPartner
    );
    
    let newInventory;
    if (existingEvoIndex !== -1) {
      // Evolved form already exists - merge by adding remaining EXP
      const remainingExp = partner.exp - evoData.evoExp;
      newInventory = userData.pokemon_inventory.map((mon, index) => {
        if (mon.id === partner.id) {
          // Remove the pre-evolution form
          return null;
        }
        if (index === existingEvoIndex) {
          // Add remaining EXP to existing evolved form
          return {
            ...mon,
            exp: (mon.exp || 0) + Math.max(0, remainingExp)
          };
        }
        return mon;
      }).filter(mon => mon !== null);
    } else {
      // Evolved form doesn't exist - update the partner in place
      newInventory = userData.pokemon_inventory.map(mon => {
        if (mon.id === partner.id) {
          return {
            ...mon,
            currentName: nextMonData.name, // Update name
            pokedexId: nextMonData.id,     // Update ID
            stage: nextMonData.evoStage,   // Update stage
            exp: 0 // Reset EXP for the new form
          };
        }
        return mon;
      });
    }
    
    // Add new species to Pokedex if it's not already there
    const newPokedex = [...userData.pokedex];
    if (!newPokedex.some(p => p.id === nextMonData.id)) {
      newPokedex.push({ id: nextMonData.id, name: nextMonData.name });
    }
    
    try {
      const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', user.uid, 'profile', 'data');
      await updateDoc(userDocRef, {
        pokemon_inventory: newInventory,
        pokedex: newPokedex
      });
      alert(`Congratulations! Your ${evoData.name} evolved into ${nextMonData.name}!`);
      // No screen change, just let the profile screen re-render
    } catch (error) {
      console.error("Error evolving Pokemon:", error);
    }
  }, [user, userData, db]);

  // Handle session completion
  const handleSessionComplete = useCallback(async (durationMinutes, sessionType, skipNavigation = false) => {
    if (!userData) return;

    const totalEncounters = Math.floor(durationMinutes / 10);
    const expGain = Math.floor(durationMinutes / 30 * 100);

    const wildPokemon = [];
    for (let i = 0; i < totalEncounters; i++) {
      const wildMonData = getRandomWildPokemon(sessionType);
      if (wildMonData) {
        wildPokemon.push(wildMonData);
      }
    }

    // Use transaction if Firebase is available
    if (user && db) {
      try {
        await runTransaction(db, async (transaction) => {
          const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', user.uid, 'profile', 'data');
          const userDoc = await transaction.get(userDocRef);
          
          if (!userDoc.exists) {
            throw new Error("User document does not exist!");
          }
          
          let currentData = userDoc.data();
          let updatedInventory = [...currentData.pokemon_inventory];
          let updatedPokedex = [...currentData.pokedex];
          let partnerIndex = updatedInventory.findIndex(p => p.isPartner);
          
          // Update Partner EXP
          if (partnerIndex !== -1) {
            let partner = updatedInventory[partnerIndex];
            const evoData = getPokemonDataByName(partner.currentName);
            
            // Only add EXP if the pokemon is not max level (evoExp === -1)
            // and not already waiting to evolve
            if (evoData && evoData.evoExp !== -1 && partner.exp < evoData.evoExp) {
              partner.exp = (partner.exp || 0) + expGain;
            }
            
            updatedInventory[partnerIndex] = partner;
          }
          
          transaction.update(userDocRef, {
            pokemon_inventory: updatedInventory,
            pokedex: updatedPokedex,
          });
        });
      } catch (e) {
        console.error("Transaction failed: ", e);
      }
    } else {
      // Fallback to local storage update
      let updatedInventory = [...userData.pokemon_inventory];
      let partnerIndex = updatedInventory.findIndex(p => p.isPartner);

      if (partnerIndex !== -1) {
        let partner = updatedInventory[partnerIndex];
        const evoData = getPokemonDataByName(partner.currentName);
        
        if (evoData && evoData.evoExp !== -1 && partner.exp < evoData.evoExp) {
          partner.exp = (partner.exp || 0) + expGain;
        }
        
        updatedInventory[partnerIndex] = partner;
      }

      const updatedData = {
        ...userData,
        pokemon_inventory: updatedInventory,
      };

      saveUserData(updatedData);
      setUserData(updatedData);
    }

    setSessionConfig({
      ...sessionConfig,
      expGained: expGain,
      encounters: wildPokemon
    });
    
    if (!skipNavigation) {
      setScreen('ENCOUNTER_SCREEN');
    }
  }, [user, userData, sessionConfig, db]);

  // Save caught Pokemon
  const saveCaughtPokemon = useCallback(async (caughtMonNames, expGain) => {
    if (!userData) return { hasNewPokemon: false, hasEvolved: false };

    let hasNewPokemon = false;
    let hasEvolved = false;

    // Use transaction if Firebase is available
    if (user && db) {
      try {
        await runTransaction(db, async (transaction) => {
          const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', user.uid, 'profile', 'data');
          const userDoc = await transaction.get(userDocRef);
          
          if (!userDoc.exists) {
            throw new Error("User profile not found.");
          }
          
          let data = userDoc.data();
          let updatedInventory = [...data.pokemon_inventory];
          let updatedPokedex = [...data.pokedex];
          
          // Partner Evolution Check (just flag, don't auto-evolve)
          let partnerIndex = updatedInventory.findIndex(p => p.isPartner);
          if (partnerIndex !== -1) {
            let partner = updatedInventory[partnerIndex];
            const evoData = getPokemonDataByName(partner.currentName);
            
            if (evoData && evoData.evoExp !== -1 && partner.exp >= evoData.evoExp) {
              // Partner is ready to evolve, set the flag
              hasEvolved = true;
            }
          }
          
          // Catching Wild Pokémon
          caughtMonNames.forEach(name => {
            const wildMonData = getPokemonDataByName(name);
            const isNew = !updatedPokedex.some(p => p.id === wildMonData.id);
            if (isNew) {
              updatedPokedex.push({ id: wildMonData.id, name: name });
              hasNewPokemon = true;
            }
            
            // Check if this pokemon already exists in inventory (duplicate)
            const existingMonIndex = updatedInventory.findIndex(
              p => p.pokedexId === wildMonData.id && !p.isPartner
            );
            
            if (existingMonIndex !== -1) {
              // Duplicate found - add 150 EXP to existing pokemon
              updatedInventory[existingMonIndex].exp = (updatedInventory[existingMonIndex].exp || 0) + 150;
            } else {
              // New pokemon - add to inventory
              updatedInventory.push({
                id: crypto.randomUUID(),
                pokedexId: wildMonData.id,
                name: name,
                type: wildMonData.type,
                exp: Math.floor(expGain / 3), // Floor the EXP
                stage: wildMonData.evoStage,
                currentName: name,
                isPartner: false,
              });
            }
          });
          
          transaction.update(userDocRef, {
            pokemon_inventory: updatedInventory,
            pokedex: updatedPokedex,
          });
        });
      } catch (error) {
        console.error("Error during catching transaction:", error);
        return { hasNewPokemon: false, hasEvolved: false };
      }
    } else {
      // Fallback to local storage update
      let updatedInventory = [...userData.pokemon_inventory];
      let updatedPokedex = [...userData.pokedex];

      // Partner Evolution Check
      let partnerIndex = updatedInventory.findIndex(p => p.isPartner);
      if (partnerIndex !== -1) {
        let partner = updatedInventory[partnerIndex];
        const evoData = getPokemonDataByName(partner.currentName);
        
        if (evoData && evoData.evoExp !== -1 && partner.exp >= evoData.evoExp) {
          hasEvolved = true;
        }
      }

      // Catching Wild Pokémon
      caughtMonNames.forEach(name => {
        const wildMonData = getPokemonDataByName(name);
        const isNew = !updatedPokedex.some(p => p.name === name);
        if (isNew) {
          updatedPokedex.push({ id: wildMonData.id, name: name });
          hasNewPokemon = true;
        }

        // Check if this pokemon already exists in inventory (duplicate)
        const existingMonIndex = updatedInventory.findIndex(
          p => p.pokedexId === wildMonData.id && !p.isPartner
        );
        
        if (existingMonIndex !== -1) {
          // Duplicate found - add 150 EXP to existing pokemon
          updatedInventory[existingMonIndex].exp = (updatedInventory[existingMonIndex].exp || 0) + 150;
        } else {
          // New pokemon - add to inventory
          updatedInventory.push({
            id: crypto.randomUUID(),
            pokedexId: wildMonData.id,
            name: name,
            type: wildMonData.type,
            exp: Math.floor(expGain / 3),
            stage: wildMonData.evoStage,
            currentName: name,
            isPartner: false,
          });
        }
      });

      const updatedData = {
        ...userData,
        pokemon_inventory: updatedInventory,
        pokedex: updatedPokedex,
      };

      saveUserData(updatedData);
      setUserData(updatedData);
    }

    return { hasNewPokemon, hasEvolved };
  }, [user, userData, db]);

  return {
    user,
    userData,
    screen,
    setScreen,
    loading: loading || !authReady,
    saveNewUser,
    handleAuthSuccess,
    handleLogout,
    handleUnlockPokedex,
    handleRevertPokedex,
    handleSetNewPartner,
    handleEvolvePartner,
    sessionConfig,
    setSessionConfig,
    handleSessionComplete,
    saveCaughtPokemon,
    tasks,
    setTasks: (newTasks) => {
      setTasks(newTasks);
      // Save to Firestore or localStorage
      if (!user || !db) {
        // Fallback to localStorage
        const updatedData = {
          ...userData,
          tasks: newTasks
        };
        saveUserData(updatedData);
        setUserData(updatedData);
      } else {
        // Save to Firestore
        const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', user.uid, 'profile', 'data');
        updateDoc(userDocRef, {
          tasks: newTasks
        }).catch((error) => {
          console.error("Error saving tasks:", error);
        });
      }
    },
  };
}
