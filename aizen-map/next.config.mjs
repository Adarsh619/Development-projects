export default (phase) => ({distDir:phase==='phase-development-server'?'.next-dev':'.next',devIndicators:false,output:'export'});
