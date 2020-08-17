export default function ({ redirect }) {
  if (!localStorage.getItem(`isLogged`)) {
    redirect({
      name: `login`,
    });
  }
}
