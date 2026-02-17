////////////////////////////////////////////////////////////////////////
//                           Creations                                //
//                                                                    //  
////////////////////////////////////////////////////////////////////////

// import { createClient } from "@supabase/supabase-js";
import { stories } from "./objects.js";


/**************************************************************************************/

const randomNumber = Math.random();

let correctKey;
let incorrectKey;

if (randomNumber < 0.5) {
  correctKey = "a";
  incorrectKey = "l";
} else {
  correctKey = "l";
  incorrectKey = "a";
}


/**************************************************************************************/

// Create suffle function - suffles array index randomly
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


/**************************************************************************************/

// Function to randomize positive/negative sentences in experimental sentences (50% each)
function randomizeExperimentalSentences(story) {
  const experimentalArray = story.filter((story) => !story.base);
  const experimentalLength = experimentalArray.length;
  const randomPosNegArray = [];

  for (let i = 0; i < experimentalLength / 2; i++) {
    randomPosNegArray[i] = "positive";
    randomPosNegArray[experimentalLength - 1 - i] = "negative";
  }

  shuffle(randomPosNegArray);

  experimentalArray.forEach(
    (experimentalObject, index) => {
      experimentalObject.text = experimentalObject.options[randomPosNegArray[index]];
      experimentalObject.type = randomPosNegArray[index];
    }
  );
}

shuffle(stories);
randomizeExperimentalSentences(stories[0].sentences);
randomizeExperimentalSentences(stories[1].sentences);

const firstStory = stories[0];
const secondStory = stories[1];


/**************************************************************************************/

/* Initialize jsPsych */
let jsPsych = initJsPsych();

/* Create timeline */
let timeline = [];

////////////////////////////////////////////////////////////////////////
//                           Consent                                  //
//                                                                    //  
////////////////////////////////////////////////////////////////////////

let check_consent = (elem) => {
  if (document.getElementById('consent_checkbox').checked) {
    return true;
  }
  else {
    alert("Muchas gracias por su interés en nuestro experimento. Si está listo para participar, por favor, dénos su consentimiento.");
    return false;
  }
  return false;
};

let html_block_consent = {
  type: jsPsychExternalHtml,
  url: "consentA2.html",
  cont_btn: "start_experiment",
  check_fn: check_consent
};
timeline.push(html_block_consent);

// // ////////////////////////////////////////////////////////////////////////
// // //                           Demographic  variables                   //
// // ////////////////////////////////////////////////////////////////////////

/* fullscreen */
// timeline.push({
//   type: jsPsychFullscreen,
//   fullscreen_mode: true,
//   message: '<p>Por favor, haga clic para cambiar al modo de pantalla completa.</p>',
//   button_label:'Continuar',
//   on_finish: function(data){
//     var help_fullscreen = data.success;
//     jsPsych.data.addProperties({fullscreen: help_fullscreen});
//   }
// });

// var participantName = {
//   type: jsPsychSurveyText,
//   preamble: 'A continuación, le preguntaremos algunos datos.',
//   name: 'participantName',
//     button_label:'Continuar',
//     questions: [{prompt:'<div>¿Cuál es su nombre y apellidos?<\div>', rows: 1, columns: 2, required: 'true'}],
//   data: {
//     type:"demo",
//     participantName: participantName,
//   },
//   on_finish: function(data){
//     var help_participantName = data.response.Q0;
//     jsPsych.data.addProperties({participantName: help_participantName});
//   },
//   on_load: function() {
//     document.querySelector('.jspsych-btn').style.marginTop = '20px'; // Adjust margin as needed
//   }
// };

// timeline.push(participantName);

// var centroAsociado = {
//   type: jsPsychSurveyText,
//   name: 'centroAsociado',
//     button_label:'Continuar',
//     questions: [{prompt:'<div>¿Cuál es su centro asociado?<\div>', rows: 1, columns: 2, required: 'true'}],
//   data: {
//     type:"demo",
//     centroAsociado: centroAsociado,
//   },
//   on_finish: function(data){
//     var help_centroAsociado = data.response.Q0;
//     jsPsych.data.addProperties({centroAsociado: help_centroAsociado});
//   },
//   on_load: function() {
//     document.querySelector('.jspsych-btn').style.marginTop = '20px'; // Adjust margin as needed
//   }
// };

// timeline.push(centroAsociado);

// var age = {
//   type: jsPsychSurveyText,
//     name: 'age',
//     button_label:'Continuar',
//     questions: [{prompt:'<div>¿Cuántos años tiene?<\div>', rows: 1, columns: 2, required: 'true'}],
//   data: {
//     type:"demo",
//     age: age,
//   },
//   on_finish: function(data){
//     var help_age = data.response.Q0;
//     jsPsych.data.addProperties({age: help_age});
//   },
//   on_load: function() {
//     document.querySelector('.jspsych-btn').style.marginTop = '20px'; // Adjust margin as needed
//   }
// };

// timeline.push(age);

// var demo2 = {
//   type: jsPsychSurveyMultiChoice,
//   questions: [
//     {
//       prompt:'Por favor, seleccione el género con el que se identifica.',
//       name: 'gender',
//       options: ["masculino", "femenino", "otro", "prefiero no decirlo"],
//       required: true,
//       horizontal: true
//     },
//      {
//       prompt:'Por favor, seleccione su lengua materna.',
//       name: 'language',
//       options: ["español", "otro"],
//       required: true,
//       horizontal: true
//     },
//   ],
//   button_label:'Continuar',
//   on_finish: function(data) {
//     var help_gender = data.response.gender;
//     var help_language = data.response.language;
//     jsPsych.data.addProperties({gender: help_gender, language: help_language});
//   }
// };
// timeline.push(demo2);


/************************************************************************************************ */

/* Fixation trial */
let fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: "NO_KEYS", // Prevent key press
  trial_duration: 500, // Fixation duration
  data: {
    task: "fixation",
  },
};

/* Welcome message trial */
let welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Bienvenido al experimento. <br /> </p></p> Pulse la barra espaciadora para comenzar.",
  choices: [' '],
};
timeline.push(welcome);


/**************************************************************************************/

/* Instructions for sentence presentation */
let instructionsSentencePresentation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Ahora verá una serie de frases en la pantalla.</p>
    </p>Cada frase describe una característica de los objetos que ha visto anteriormente, que podrá ser verdadera o falsa.</p>
    </p></p>
    <p>Si la frase es verdadera, pulse la tecla '${correctKey.toUpperCase()}' (sí).</p>
    <p>Si la frase es falsa, pulse la tecla '${incorrectKey.toUpperCase()}' (no).</p>
    </p></p>
    <p>Le recomendamos colocar los dedos sobre las teclas ${correctKey.toUpperCase()} y ${incorrectKey.toUpperCase()} durante la tarea para no olvidarlas.</p>
    </p>Por ejemplo: si anteriormente ha visto la imagen de una caja abierta y luego aparece la frase: "La caja estaba cerrada", deberá pulsar "NO".</p>
    <br />
    <div>
      <img src='https://raw.githubusercontent.com/saramff/objects-attributes-images/refs/heads/master/Caja.jpg'  class="img-instructions" />
    </div>
    <br />
    <p>Pulse la barra espaciadora para continuar.<p>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(instructionsSentencePresentation);

/* Create stimuli array for sentence presentation */
let sentencesPresentationStimuli = firstStory.sentences.map((sentence) => {
  return {
    stimulus: `
      <h3 class="sentence">${sentence.text}</h3>
    `,
    type: sentence.type,
    keyword1: sentence.keyword1,
    keyword2: sentence.keyword2,
  };
});

/* Sentences presentation trial */
let sentencesPresentation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("stimulus"),
  choices: [' '],
  data: {
    task: "sentences presentation",
    type: jsPsych.timelineVariable("type"),
    keyword1: jsPsych.timelineVariable("keyword1"),
    keyword2: jsPsych.timelineVariable("keyword2"),
  },
};

/* Test procedure: fixation + sentences presentation */
let sentencesPresentationProcedure = {
  timeline: [fixation, sentencesPresentation],
  timeline_variables: sentencesPresentationStimuli,
};
timeline.push(sentencesPresentationProcedure);


/**************************************************************************************/

/* Instructions for question presentation */
let instructionsQuestions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Ahora verá una serie de frases en la pantalla.</p>
    </p>Cada frase describe una característica de los objetos que ha visto anteriormente, que podrá ser verdadera o falsa.</p>
    </p></p>
    <p>Si la frase es verdadera, pulse la tecla '${correctKey.toUpperCase()}' (sí).</p>
    <p>Si la frase es falsa, pulse la tecla '${incorrectKey.toUpperCase()}' (no).</p>
    </p></p>
    <p>Le recomendamos colocar los dedos sobre las teclas ${correctKey.toUpperCase()} y ${incorrectKey.toUpperCase()} durante la tarea para no olvidarlas.</p>
    </p>Por ejemplo: si anteriormente ha visto la imagen de una caja abierta y luego aparece la frase: "La caja estaba cerrada", deberá pulsar "NO".</p>
    <br />
    <div>
      <img src='https://raw.githubusercontent.com/saramff/objects-attributes-images/refs/heads/master/Caja.jpg'  class="img-instructions" />
    </div>
    <br />
    <p>Pulse la barra espaciadora para continuar.<p>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(instructionsQuestions);

/* questions presentation trial */
let questionPresentationTrial = firstStory.questions.map((question) => {
  return {
    type: jsPsychSurveyMultiChoice,
    questions: [
      {
        prompt: question.question,
        name: "response",
        options: question.answers.map((answer) => answer.answer),
        required: true
      }
    ],
    data: {
      task: "questions presentation",
      question_text: question.question
    },
    on_finish: function(data){
      // respuesta elegida por el participante
      let chosen = data.response.response;
      // buscamos esa respuesta dentro del array answers
      let answerObj = question.answers.find(a => a.answer === chosen);
      // guardamos si es correcta o no
      data.correct = answerObj ? answerObj.correct : false;
    }
  }
});

/* Test procedure: fixation + questions presentation */
let questionPresentationProcedure = {
  timeline: [fixation, questionPresentationTrial],
};
timeline.push(questionPresentationProcedure);


/**************************************************************************************/

/* Instructions for sentence presentation */
let instructionsSentencePresentation2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Ahora verá una serie de frases en la pantalla.</p>
    </p>Cada frase describe una característica de los objetos que ha visto anteriormente, que podrá ser verdadera o falsa.</p>
    </p></p>
    <p>Si la frase es verdadera, pulse la tecla '${correctKey.toUpperCase()}' (sí).</p>
    <p>Si la frase es falsa, pulse la tecla '${incorrectKey.toUpperCase()}' (no).</p>
    </p></p>
    <p>Le recomendamos colocar los dedos sobre las teclas ${correctKey.toUpperCase()} y ${incorrectKey.toUpperCase()} durante la tarea para no olvidarlas.</p>
    </p>Por ejemplo: si anteriormente ha visto la imagen de una caja abierta y luego aparece la frase: "La caja estaba cerrada", deberá pulsar "NO".</p>
    <br />
    <div>
      <img src='https://raw.githubusercontent.com/saramff/objects-attributes-images/refs/heads/master/Caja.jpg'  class="img-instructions" />
    </div>
    <br />
    <p>Pulse la barra espaciadora para continuar.<p>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(instructionsSentencePresentation2);

/* Create stimuli array for sentence presentation */
let sentencesPresentationStimuli2 = secondStory.sentences.map((sentence) => {
  return {
    stimulus: `
      <h3 class="sentence">${sentence.text}</h3>
    `,
    type: sentence.type,
    keyword1: sentence.keyword1,
    keyword2: sentence.keyword2,
  };
});

/* Sentences presentation trial */
let sentencesPresentation2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("stimulus"),
  choices: [' '],
  data: {
    task: "sentences presentation",
    type: jsPsych.timelineVariable("type"),
    keyword1: jsPsych.timelineVariable("keyword1"),
    keyword2: jsPsych.timelineVariable("keyword2"),
  },
};

/* Test procedure: fixation + sentences presentation */
let sentencesPresentationProcedure2 = {
  timeline: [fixation, sentencesPresentation2],
  timeline_variables: sentencesPresentationStimuli2,
};
timeline.push(sentencesPresentationProcedure2);


/**************************************************************************************/

/* Instructions for question presentation */
let instructionsQuestions2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Ahora verá una serie de frases en la pantalla.</p>
    </p>Cada frase describe una característica de los objetos que ha visto anteriormente, que podrá ser verdadera o falsa.</p>
    </p></p>
    <p>Si la frase es verdadera, pulse la tecla '${correctKey.toUpperCase()}' (sí).</p>
    <p>Si la frase es falsa, pulse la tecla '${incorrectKey.toUpperCase()}' (no).</p>
    </p></p>
    <p>Le recomendamos colocar los dedos sobre las teclas ${correctKey.toUpperCase()} y ${incorrectKey.toUpperCase()} durante la tarea para no olvidarlas.</p>
    </p>Por ejemplo: si anteriormente ha visto la imagen de una caja abierta y luego aparece la frase: "La caja estaba cerrada", deberá pulsar "NO".</p>
    <br />
    <div>
      <img src='https://raw.githubusercontent.com/saramff/objects-attributes-images/refs/heads/master/Caja.jpg'  class="img-instructions" />
    </div>
    <br />
    <p>Pulse la barra espaciadora para continuar.<p>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(instructionsQuestions2);

/* questions presentation trial */
let questionPresentationTrial2 = secondStory.questions.map((question) => {
  return {
    type: jsPsychSurveyMultiChoice,
    questions: [
      {
        prompt: question.question,
        name: "response",
        options: question.answers.map((answer) => answer.answer),
        required: true
      }
    ],
    data: {
      task: "questions presentation",
      question_text: question.question
    },
    on_finish: function(data){
      // respuesta elegida por el participante
      let chosen = data.response.response;
      // buscamos esa respuesta dentro del array answers
      let answerObj = question.answers.find(a => a.answer === chosen);
      // guardamos si es correcta o no
      data.correct = answerObj ? answerObj.correct : false;
    }
  }
});

/* Test procedure: fixation + questions presentation */
let questionPresentationProcedure2 = {
  timeline: [fixation, questionPresentationTrial2],
};
timeline.push(questionPresentationProcedure2);


/**************************************************************************************/


/* Instructions for Tetris */
let instructionstetris = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Ahora jugará al Tetris durante aproximadamente 20 minutos.</p>
    <p>En Tetris, hay piezas de diferentes formas que caen desde la parte superior de la pantalla. <br /> Su objetivo es moverlas y girarlas para que encajen y formen líneas horizontales completas. <br /> Cuando una línea se completa, desaparece. <br /> Si las piezas se acumulan hasta llegar a la parte superior, pierde.</p> <p>Controles:</p> <strong>Flecha izquierda:</strong> Mueve la pieza a la izquierda <br /> <strong>Flecha derecha:</strong> Mueve la pieza a la derecha <br /> <strong>Flecha arriba:</strong> Gira la pieza <br /> <strong>Flecha abajo:</strong> Acelera la caída <p>Cuando aparezca la pantalla del juego, haga clic en <strong>"Play"</strong> para iniciar.</p> <p>Si pierde, seleccione <strong>"Try again"</strong> para reiniciar. <br /> Jugará de esta manera hasta que se agote el tiempo.</p> <p>Pulse la barra espaciadora para comenzar.</p>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(instructionstetris);

/* Tetris */
let tetris = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="tetris-visible"></div>
  `,
  post_trial_gap: 500,
  choices: "NO_KEYS", // Prevent key press
  trial_duration: 1, 
};
timeline.push(tetris);


/**************************************************************************************/


// /* Instructions for objects experimental images presentation */
// let instructionsObjectsNamePresentation = {
//   type: jsPsychHtmlKeyboardResponse,
//   stimulus: `
//     <p>Ahora realizará la siguiente tarea:</p>
//     <p>Si ha visto antes el objeto, pulse la tecla '${correctKey.toUpperCase()}' (presente).</p>
//     <p>Si no ha visto antes el objeto, pulse la tecla '${incorrectKey.toUpperCase()}' (no presente).</p>
//     <p>De nuevo, le recomendamos colocar los dedos sobre las teclas ${correctKey.toUpperCase()} y ${incorrectKey.toUpperCase()} durante la tarea para no olvidarlas.</p>
//     <p>Pulse la barra espaciadora para comenzar.</p>
//   `,
//   choices: [' '],
//   post_trial_gap: 500,
// };
// timeline.push(instructionsObjectsNamePresentation);

// /* Create stimuli array for objects experimental images presentation */
// let objectsExperimentalRecognitionStimuli = objectsExperimental.map((objExperimental) => {
//   return {
//     stimulus: `
//       <img class="object-img" src="${objExperimental.img}">
//       <div class="keys">
//         <p class="${correctKey === 'a' ? 'left' : 'right'}">PRESENTE</p>
//         <p class="${correctKey === 'a' ? 'right' : 'left'}">NO PRESENTE</p>
//       </div>
//     `,
//     correct_response: objExperimental.correct_response
//   };
// });

// /* Objects experimental images presentation trial */
// let testObjectsExperimentalImg = {
//   type: jsPsychHtmlKeyboardResponse,
//   stimulus: jsPsych.timelineVariable("stimulus"),
//   choices: ['a', 'l'],
//   data: {
//     task: "response objects experimental images test",
//     correct_response: jsPsych.timelineVariable("correct_response"),
//   },
//   on_finish: function (data) {
//     data.correct = jsPsych.pluginAPI.compareKeys(
//       data.response,
//       data.correct_response
//     );
//     data.correct_response_meaning = correctKey === data.correct_response ? "PRESENTE" : "NO PRESENTE";
//   },
// };

// /* Test procedure: fixation + objects experimental images presentation */
// let testObjectsExperimentalImgProcedure = {
//   timeline: [fixation, testObjectsExperimentalImg],
//   timeline_variables: objectsExperimentalRecognitionStimuli,
//   randomize_order: true, // Randomize objects name order
// };
// timeline.push(testObjectsExperimentalImgProcedure);


// /**************************************************************************************/


// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_API_KEY
// );

// const TABLE_NAME = "experimento_objetos_atributos_espanol";

// async function saveData(data) {
//   console.log(data);
//   const { error } = await supabase.from(TABLE_NAME).insert({ data });

//   return { error };
// }

// const saveDataBlock = {
//   type: jsPsychCallFunction,
//   func: function() {
//     saveData(jsPsych.data.get())
//   },
//   timing_post_trial: 200
// }

// timeline.push(saveDataBlock);



// /**************************************************************************************/


/* Goodbye message trial */
let goodbye = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Muchas gracias por haber realizado el experimento. <br /> </p></p> Pulsa la barra espaciadora para salir.",
  choices: [' '],
};
timeline.push(goodbye);


// /**************************************************************************************/



/* Run the experiment */
jsPsych.run(timeline);

// Uncomment to see the results on the console (for debugging)
console.log(jsPsych.data.get());