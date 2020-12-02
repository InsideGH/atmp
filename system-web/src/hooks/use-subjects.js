import { useEffect, useState } from 'react';

export function useSubjects() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetch('/api/system/subjects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(
        (subjects) => {
          setSubjects(subjects);
        },
        (error) => {
          console.error('subject error', error);
        },
      );
  }, []);

  return subjects;
}
