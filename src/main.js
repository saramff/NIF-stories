////////////////////////////////////////////////////////////////////////
//                           Creations                                //
//                                                                    //  
////////////////////////////////////////////////////////////////////////

import { createClient } from "@supabase/supabase-js";
import { stories, words } from "./objects.js";


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

words.forEach((word) => {
  if (word.old) word.correctResponse = correctKey;
  else word.correctResponse = incorrectKey;  
})

shuffle(words);


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

////////////////////////////////////////////////////////////////////////
//                           Demographic  variables                   //
////////////////////////////////////////////////////////////////////////

/* fullscreen */
timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  message: '<p>Por favor, haga clic para cambiar al modo de pantalla completa.</p>',
  button_label:'Continuar',
  on_finish: function(data){
    var help_fullscreen = data.success;
    jsPsych.data.addProperties({fullscreen: help_fullscreen});
  }
});

var age = {
  type: jsPsychSurveyText,
    preamble: 'A continuación, le preguntaremos algunos datos.',
    name: 'age',
    button_label:'Continuar',
    questions: [{prompt:'<div>¿Cuántos años tiene?<\div>', rows: 1, columns: 2, required: 'true'}],
  data: {
    type:"demo",
    age: age,
  },
  on_finish: function(data){
    var help_age = data.response.Q0;
    jsPsych.data.addProperties({age: help_age});
  },
  on_load: function() {
    document.querySelector('.jspsych-btn').style.marginTop = '20px'; // Adjust margin as needed
  }
};

timeline.push(age);

var demo2 = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt:'Por favor, seleccione el género con el que se identifica.',
      name: 'gender',
      options: ["masculino", "femenino", "otro", "prefiero no decirlo"],
      required: true,
      horizontal: true
    },
     {
      prompt:'Por favor, seleccione su lengua materna.',
      name: 'language',
      options: ["español", "otro"],
      required: true,
      horizontal: true
    },
  ],
  button_label:'Continuar',
  on_finish: function(data) {
    var help_gender = data.response.gender;
    var help_language = data.response.language;
    jsPsych.data.addProperties({gender: help_gender, language: help_language});
  }
};
timeline.push(demo2);


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
  stimulus: `<div class="instrucciones">
  <p>Bienvenido al experimento.</p>
  <p>Pulse la barra espaciadora para comenzar.</p>
</div>`,
  choices: [' '],
};
timeline.push(welcome);


/**************************************************************************************/

/* Instructions for sentence presentation */
let instructionsSentencePresentation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
  <div class="instrucciones">
    <p>Ahora va a leer una historia.</p>
    <p>La historia se presentará <strong>en segmentos</strong> (por ejemplo, una frase cada vez).</p>
    <p>Su tarea consiste únicamente en <strong>leer detenidamente</strong> la información.</p>
    <p><strong>Muy importante:</strong> preste mucha atención durante la lectura, porque <strong>después le haremos unas preguntas</strong> sobre el contenido del texto.</p>
    <p>Para poder responder correctamente, asegúrese de <strong>comprender bien cada fragmento</strong> antes de pasar al siguiente.</p>
    <p>Puede tomarse el tiempo que necesite para leer cada fragmento:<br>
    <strong>usted</strong> decidirá cuándo pasar al siguiente.</p>
    <p>Para avanzar y ver el siguiente fragmento, pulse la <strong>barra espaciadora</strong>.</p>
    <br />
    <p><strong>Pulse la barra espaciadora para comenzar.</strong></p>
  </div>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(instructionsSentencePresentation);


/* Instructions for sentence presentation reminder */
let instructionsSentencePresentation_reminder = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
  <div class="instrucciones">
    <p>⚠️ <strong>Recuerda:</strong></p>
    <p>Es fundamental que leas el texto con <strong>mucha atención</strong>.</p>
    <p>Al finalizar la lectura, <strong>responderás preguntas sobre su contenido</strong>.</p>
    <p>Tu objetivo es <strong>comprender bien</strong> cada fragmento antes de continuar.</p>
    <br />
    <p><strong>Pulse la barra espaciadora para comenzar la lectura.</strong></p>
  </div>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(instructionsSentencePresentation_reminder);


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

/*End of story instructions */
let endOfStory1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
  <div class="instrucciones">
    <p>— Fin del texto —</p>
    <br />
    <p><strong>Pulse la barra espaciadora para continuar.</strong></p>
  </div>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(endOfStory1);

/**************************************************************************************/

/* Instructions for question presentation */
let instructionsQuestions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
  <div class="instrucciones">
    <p>A continuación verá una serie de preguntas sobre el texto que acaba de leer.</p>
    <p>Lea cada pregunta con atención y seleccione con el <strong>ratón</strong> la respuesta que considere correcta.</p>
    <p>No hay límite de tiempo, pero intente responder basándose únicamente en la información presentada en el texto.</p>
    <br />
    <p>Pulse la barra espaciadora para comenzar.<p>
  </div>
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
  <div class="instrucciones">
    <p>Ahora va a leer un segundo texto.</p>
    <p>Al igual que antes, el texto se presentará en pantallas sucesivas.</p>
    <p>Su tarea es la misma: <strong>lea detenidamente</strong> cada parte del texto.</p>
    <p>Es importante que preste atención, porque al finalizar le haremos unas preguntas sobre el contenido.</p>
    <p>No hay límite de tiempo: puede tomarse el tiempo que necesite en cada pantalla.<br>
    Para avanzar, pulse la <strong>barra espaciadora</strong>.</p>
    <br />
    <p>Pulse la barra espaciadora para comenzar.<p>
   </div>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(instructionsSentencePresentation2);

/* Instructions for sentence presentation reminder 2 */
let instructionsSentencePresentation_reminder2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
  <div class="instrucciones">
    <p>⚠️ <strong>Recuerda:</strong></p>
    <p>Es fundamental que leas el texto con <strong>mucha atención</strong>.</p>
    <p>Al finalizar la lectura, <strong>responderás preguntas sobre su contenido</strong>.</p>
    <p>Tu objetivo es <strong>comprender bien</strong> cada fragmento antes de continuar.</p>
    <br />
    <p><strong>Pulse la barra espaciadora para comenzar la lectura.</strong></p>
  </div>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(instructionsSentencePresentation_reminder2);

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

/* End of story 2 */
let endOfStory2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
  <div class="instrucciones">
    <p>— Fin del texto —</p>
    <br />
    <p><strong>Pulse la barra espaciadora para continuar.</strong></p>
  </div>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(endOfStory2);

/**************************************************************************************/

/* Instructions for question presentation */
let instructionsQuestions2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
  <div class="instrucciones">
    <p>A continuación verá una serie de preguntas sobre este segundo texto que acaba de leer.</p>
    <p>Lea cada pregunta con atención y seleccione con el <strong>ratón</strong> la respuesta que considere correcta.</p>
    <p>Intente responder basándose únicamente en la información presentada en el texto.</p>
    <br />
    <p>Pulse la barra espaciadora para comenzar.<p>
  </div>
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
  <div class="instrucciones">
    <p>Ahora jugará al Tetris durante aproximadamente 20 minutos.</p>
    <p>En Tetris, hay piezas de diferentes formas que caen desde la parte superior de la pantalla.</p>
    <p>Su objetivo es moverlas y girarlas para que encajen y formen líneas horizontales completas.</p>
    <p>Cuando una línea se completa, desaparece. Si las piezas se acumulan hasta llegar a la parte superior, pierde.</p>
    <p>Controles:</p>
    <p><strong>Flecha izquierda:</strong> Mueve la pieza a la izquierda</p>
    <p><strong>Flecha derecha:</strong> Mueve la pieza a la derecha</p>
    <p><strong>Flecha arriba:</strong> Gira la pieza</p>
    <p><strong>Flecha abajo:</strong> Acelera la caída</p>
    <p>Cuando aparezca la pantalla del juego, haga clic en <strong>"Play"</strong> para iniciar.</p>
    <p>Si pierde, seleccione <strong>"Try again"</strong> para reiniciar. Jugará de esta manera hasta que se agote el tiempo.</p>
    <br />
    <p><strong>Pulse la barra espaciadora para comenzar.</strong></p>
  </div>
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


/* Instructions for words presentation */
let instructionsWordsPresentation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
  <div class="instrucciones">
    <p>Ahora realizará la siguiente tarea:</p>
    <p>A continuación verá una serie de <strong>palabras</strong> en la pantalla que se mostrarán una a una.</p>
    <p>Algunas de estas palabras han podido aparecer en los textos que leyó anteriormente y otras serán nuevas.</p>
    <p>Su tarea consiste en indicar si cada palabra estuvo <strong>PRESENTE</strong> o <strong>NO PRESENTE</strong> en cualquiera de los dos textos.</p>

    <p>Para responder hará lo siguiente:</p>
    <p><strong>Si ha visto<strong> antes el objeto, pulse la tecla '${correctKey.toUpperCase()}' (presente).</p>
    <p><strong>Si no ha visto<strong> antes el objeto, pulse la tecla '${incorrectKey.toUpperCase()}' (no presente).</p>
    <p>Le recomendamos colocar los dedos sobre las teclas ${correctKey.toUpperCase()} y ${incorrectKey.toUpperCase()} durante la tarea para no olvidarlas.</p>
    <p>Pulse la barra espaciadora para comenzar.</p>
  </div>
  `,
  choices: [' '],
  post_trial_gap: 500,
};
timeline.push(instructionsWordsPresentation);

/* Create stimuli array for words presentation */
let wordsStimuli = words.map((word) => {
  return {
    stimulus: `
      <h3 class="sentence">${word.word}</h3>
      <div class="keys">
        <p class="${correctKey === 'a' ? 'left' : 'right'}">PRESENTE</p>
        <p class="${correctKey === 'a' ? 'right' : 'left'}">NO PRESENTE</p>
      </div>
    `,
    correct_response: word.correctResponse
  };
});

/* words presentation trial */
let testWords = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: jsPsych.timelineVariable("stimulus"),
  choices: ['a', 'l'],
  data: {
    task: "response words test",
    correct_response: jsPsych.timelineVariable("correct_response"),
  },
  on_finish: function (data) {
    data.correct = jsPsych.pluginAPI.compareKeys(
      data.response,
      data.correct_response
    );
    data.correct_response_meaning = correctKey === data.correct_response ? "PRESENTE" : "NO PRESENTE";
  },
};

/* Test procedure: fixation + words presentation */
let testWordsProcedure = {
  timeline: [fixation, testWords],
  timeline_variables: wordsStimuli,
  randomize_order: true, // Randomize objects name order
};
timeline.push(testWordsProcedure);


// /**************************************************************************************/


const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_API_KEY
);

const TABLE_NAME = "StoriesNIFMainObject";

async function saveData(data) {
  console.log(data);
  const { error } = await supabase.from(TABLE_NAME).insert({ data });

  return { error };
}

const saveDataBlock = {
  type: jsPsychCallFunction,
  func: function() {
    saveData(jsPsych.data.get())
  },
  timing_post_trial: 200
}

timeline.push(saveDataBlock);



// /**************************************************************************************/


/* Goodbye message trial */
let goodbye = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="instrucciones">
      <p>Muchas gracias por haber realizado el experimento.</p>
      <p>Pulsa la barra espaciadora para salir.</p>
    </div>
  `,
  choices: [' '],
};
timeline.push(goodbye);


// /**************************************************************************************/



/* Run the experiment */
jsPsych.run(timeline);

// Uncomment to see the results on the console (for debugging)
console.log(jsPsych.data.get());