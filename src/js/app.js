App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Cargar las mascotas desde el archivo JSON.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      // Iterar sobre los datos de las mascotas y crear el contenido dinámico para cada mascota.
      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Verificar si el navegador admite la conexión a una billetera Ethereum.
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Solicitar acceso a la cuenta del usuario.
        await window.ethereum.enable();
      } catch (error) {
        // El usuario denegó el acceso a la cuenta...
        console.error("User denied account access")
      }
    }
    // Navegadores dApp antiguos...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // Si no se detecta una instancia de web3 inyectada, utilizar Ganache como proveedor.
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    // Crear una instancia de web3 utilizando el proveedor seleccionado.
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },
  initContract: function() {
    // Obtener el archivo de artefacto del contrato y crear una instancia del contrato con @truffle/contract
    $.getJSON('Adoption.json', function(data) {
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
  
      // Establecer el proveedor para nuestro contrato
      App.contracts.Adoption.setProvider(App.web3Provider);
  
      // Utilizar nuestro contrato para recuperar y marcar las mascotas adoptadas
      return App.markAdopted();
    });
  
    // Vincular eventos a los elementos de la interfaz de usuario
    return App.bindEvents();
  },
  
  bindEvents: function() {
    // Vincular el evento de clic en el botón de adopción a la función handleAdopt
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '#btn-adopted', App.showAdoptedPets);
    $(document).on('click', '#peliculasnuevas', App.peliculasNuevas);
    $(document).on('click', '#todas-peliculas', App.showAllPets);
    $(document).on('click', '#getPetButton', App.handleSearchByName);
  },
  
  markAdopted: function() {
    var adoptionInstance;
  
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
  
      // Llamar a la función getAdopters en el contrato para obtener los adoptantes
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        // Marcar las mascotas adoptadas deshabilitando los botones correspondientes
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Comprada').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  showAdoptedPets: function() {
    // Ocultar todas las mascotas
    $('.panel-pet').hide();
  
    var adoptionInstance;
  
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
  
      // Llamar a la función getAdopters en el contrato para obtener los adoptantes
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        // Mostrar solo las mascotas adoptadas
          $('.panel-pet').eq(i).show();
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  showAllPets: function() {
    // Ocultar todas las mascotas
    $('.panel-pet').hide();
  
    var adoptionInstance;
  
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
  
      // Llamar a la función getAdopters en el contrato para obtener los adoptantes
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        // Mostrar solo las mascotas adoptadas
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).show();
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  peliculasNuevas: function() {
    // Ocultar todas las mascotas
    $('.panel-pet').hide();
  
    var adoptionInstance;
  
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
  
      // Llamar a la función getAdopters en el contrato para obtener los adoptantes
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        console.log(adopters)
        // Mostrar solo las mascotas adoptadas
        if (adopters[i] === '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).show();
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();
  
    // Obtener el ID de la mascota desde el atributo 'data-id' del botón de adopción
    var petId = parseInt($(event.target).data('id'));
  
    var adoptionInstance;
  
    // Obtener las cuentas del usuario desde web3
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
  
      // Obtener la cuenta del usuario
      var account = accounts[0];
  
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
  
        // Ejecutar la función 'adopt' del contrato como una transacción, enviando la cuenta del usuario
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        // Marcar las mascotas adoptadas en la interfaz de usuario
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleSearchByName: async function(event) {
    event.preventDefault();
  
    var petNameInput = document.getElementById('petNameInput');
    var petName = petNameInput.value.trim();
  
    if (petName === '') {
      alert('Please enter a pet name');
      return; }
  
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
      return adoptionInstance.getAdoptedPetsByAddress("0xF17e366bF34d245A295380acA5dDABF01CE5e03C");
    }).then(function(petIdsArray) {
      var petIds = petIdsArray.map(function(petId) {
        return petId.toNumber();
      });
      console.log(petIds)
      console.log("IDs de las mascotas adoptadas:", petIdsArray);
    }).catch(function(err) {
      alert('Pet not found');
      console.log(err.message);
    });
     },};

$(function() {
  $(window).load(function() {
    // Inicializar la aplicación cuando se carga la ventana
    App.init();
  });
});
