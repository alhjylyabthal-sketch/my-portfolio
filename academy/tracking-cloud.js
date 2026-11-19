import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,signInAnonymously,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getFirestore,collection,addDoc,getDocs,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
const app=initializeApp({apiKey:"AIzaSyANrZEbH6Iq2iDkG_qn_QZVx6BPZvNusF0",authDomain:"little-math-academy-45ac0.firebaseapp.com",projectId:"little-math-academy-45ac0",appId:"1:975394385544:web:c5376363eea86f94d5f93d"});
export const auth=getAuth(app),db=getFirestore(app);
export async function submitResult(identity,attempt,legacy=false){
if(!auth.currentUser)await signInAnonymously(auth);
if(!auth.currentUser.isAnonymous)throw Error('استخدم جهاز الطالب');
return addDoc(collection(db,'studentResults'),{uid:auth.currentUser.uid,name:identity.name.trim(),father:identity.father.trim(),section:identity.section,lesson:String(attempt.lesson),title:String(attempt.title),score:Number(attempt.score),correct:Number(attempt.correct),total:Number(attempt.total),date:String(attempt.date),legacy,receivedAt:serverTimestamp()});
}
export async function teacherLogin(email,password){await signInWithEmailAndPassword(auth,email,password);if(auth.currentUser.uid!=='LjIzYFYtuEX78JkDkHvAt8ljMBh1'){await signOut(auth);throw Error('غير مصرح');}}
export async function readResults(){return (await getDocs(collection(db,'studentResults'))).docs.map(d=>({id:d.id,...d.data()}));}
