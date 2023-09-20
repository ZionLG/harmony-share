import {
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";

type AudioStatus = "idle" | "loaded" | "playing" | "paused";

type useAudioType = {
  url: string;
  playOnLoad: boolean;
};

export type useAudioReturnType = {
  setUrlState: Dispatch<SetStateAction<string>>;
  status: AudioStatus;
  play: () => void;
  pause: () => void;
  urlState: string;
};
export default function useAudio({ url, playOnLoad = false }: useAudioType) {
  const [urlState, setUrlState] = useState<string>(url);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [status, setStatus] = useState<AudioStatus>("idle");

  useEffect(() => {
    if (urlState) {
      setAudio(new Audio(urlState));
    } else {
      setAudio(null);
    }
  }, [urlState]);

  const play = useCallback(async () => {
    if (audio) {
      await audio.play();
      setStatus("playing");
    }
  }, [audio]);

  const pause = useCallback(() => {
    if (audio) {
      audio.pause();
      setStatus("paused");
      setUrlState("");
    }
  }, [audio]);

  useEffect(() => {
    const loadedDataHandler = () => {
      setAudioReady(true);
      if (audio?.duration === Infinity) {
        audio.currentTime = 1e101;
        audio.ontimeupdate = () => {
          if (audio) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            audio.ontimeupdate = () => {};
            audio.currentTime = 0;
          }
        };
      }
    };

    const endedHandler = () => {
      setStatus("paused");
    };

    if (audio) {
      audio.load();
      setStatus("loaded");
      audio.addEventListener("loadeddata", loadedDataHandler);
      audio.addEventListener("ended", endedHandler);

      if (playOnLoad) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        play();
      }
    }
    return () => {
      audio?.removeEventListener("loadeddata", loadedDataHandler);
      audio?.removeEventListener("ended", endedHandler);
    };
  }, [audio, audioReady, play, playOnLoad]);

  return {
    setUrlState,
    status,
    play,
    pause,
    urlState,
  };
}
