fetch('https://opensky-network.org/api/states/all?lamin=30&lomin=7&lamax=38&lomax=12')
  .then(r => r.json())
  .then(d => console.log('Planes over Tunisia:', d.states?.length || 0))
  .catch(e => console.error('OpenSky Error:', e));
