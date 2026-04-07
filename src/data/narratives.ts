  import { Narrative } from '@/lib/types';

  export const NARRATIVES: Narrative[] = [
    {
      id: "n1",
      title: "Global Flashpoints: 1939-1945",
      description: "A guided tour through the defining moments of the deadliest conflict in human history, tracing the expansion and collapse of the Axis powers.",
      steps: [
        {
          title: "The Invasion of Poland",
          year: 1939,
          description: "The German invasion of Poland on September 1, 1939, marks the definitive start of World War II in Europe, prompting Britain and France to declare war.",
          lat: 52.0, 
          lng: 19.0
        },
        {
          title: "The Fall of France",
          year: 1940,
          description: "German forces bypass the Maginot Line, sweeping through the Low Countries and capturing Paris, reshaping the balance of power in Western Europe.",
          lat: 48.8, 
          lng: 2.3
        },
        {
          title: "Operation Barbarossa",
          year: 1941,
          description: "The Axis invasion of the Soviet Union opens the largest and deadliest land theatre of war in history.",
          lat: 55.7, 
          lng: 37.6
        },
        {
          title: "Pearl Harbor",
          year: 1941,
          description: "A surprise military strike by the Imperial Japanese Navy upon the United States naval base at Pearl Harbor catapults the US into the global conflict.",
          lat: 21.3, 
          lng: -157.9
        },
        {
          title: "The Dawn of the Atomic Age",
          year: 1945,
          description: "The United States detonates two atomic bombs over the Japanese cities of Hiroshima and Nagasaki, forcing Japan's surrender and ending the war.",
          lat: 34.3, 
          lng: 132.4
        }
      ]
    },
    {
      id: "n2",
      title: "Echoes of the Cold War",
      description: "Explore the proxy conflicts and geopolitical standoffs that defined the latter half of the 20th century between the superpowers.",
      steps: [
        {
          title: "The Chinese Civil War Resumes",
          year: 1946,
          description: "Following WWII, fighting resumes between the Kuomintang and the Chinese Communist Party, fundamentally altering the Asian political landscape.",
          lat: 35.8, 
          lng: 104.1
        },
        {
          title: "The Korean Peninsula",
          year: 1950,
          description: "North Korean forces cross the 38th parallel, sparking the first major proxy war of the Cold War era.",
          lat: 38.0, 
          lng: 127.0
        },
        {
          title: "The Vietnam Escalation",
          year: 1965,
          description: "The United States drastically increases its military presence in South Vietnam, aiming to prevent a communist takeover of the region.",
          lat: 14.0, 
          lng: 108.0
        },
        {
          title: "The Soviet-Afghan War",
          year: 1979,
          description: "Soviet forces intervene in Afghanistan to support the communist government against mujahideen forces, dragging the USSR into a decade-long quagmire.",
          lat: 33.9, 
          lng: 67.7
        }
      ]
    }
  ];
