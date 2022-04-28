import React from 'react';

// 调用方式如下，AccountModifyNameDialog在内部实现的时候注意两点：
// 1，不需要用visible控制自己是否显示，DialogManager会控制是否显示，自己常在就可以了
// 2，内部在需要关闭自己时，一定需要调用props.onClose，从而DialogManager传递给AccountModifyNameDialog的props.onClose得以执行

// DialogManager.show({
//   render: (
//     <AccountModifyNameDialog
//       account={item}
//       onClose={() => {
//         console.log('dialog manager');
//       }}
//       onDone={() => {
//         refreshAccounts();
//       }}
//     />
//   ),
// });

// function AccountModifyNameDialog(props: { onClose?: () => void }) {
//   return <Text onPress={props.onClose?.()}>A</Text>
// }

type InnerComponentProps = {
  onClose?: () => void;
};

let innerNode: React.ReactElement<InnerComponentProps> | null = null;

interface DialogHolderRef {
  show: () => void;
}

const DialogHolder = React.forwardRef<DialogHolderRef>((_props, ref) => {
  const [active, setActive] = React.useState(false);
  const hide = React.useCallback(() => {
    if (active === true) {
      innerNode?.props.onClose?.();
      innerNode = null;
      setActive(false);
    }
  }, [active]);

  // This must use useCallback to ensure the ref doesn't get set to null and then a new ref every render.
  React.useImperativeHandle(
    ref,
    React.useCallback(
      () => ({
        show: () => {
          setActive(true);
        },
      }),
      [setActive],
    ),
  );

  if (innerNode && active) {
    const element = React.cloneElement(innerNode, {
      onClose: hide,
    });
    return element;
  }
  return null;
});

DialogHolder.displayName = 'DialogHolder';

let refs: DialogHolderRef[] = [];

function addNewRef(newRef: DialogHolderRef) {
  refs.push(newRef);
}

function removeOldRef(oldRef: DialogHolderRef | null) {
  refs = refs.filter((r) => r !== oldRef);
}

const DialogHolderContainer: React.FC = () => {
  const holderRef = React.useRef<DialogHolderRef | null>(null);

  /*
    This must use `useCallback` to ensure the ref doesn't get set to null and then a new ref every render.
    Failure to do so will cause whichever DialogHolderContainer *renders or re-renders* last to be the instance that is used,
    rather than being the DialogHolderContainer that was *mounted* last.
  */
  const setRef = React.useCallback((ref: DialogHolderRef | null) => {
    // Since we know there's a ref, we'll update `refs` to use it.
    if (ref) {
      // store the ref in this dialog instance to be able to remove it from the array later when the ref becomes null.
      holderRef.current = ref;
      addNewRef(ref);
    } else {
      // remove the this dialog's ref, wherever it is in the array.
      removeOldRef(holderRef.current);
    }
  }, []);

  return <DialogHolder ref={setRef} />;
};

function getRef() {
  const reversePriority = [...refs].reverse();
  const activeRef = reversePriority.find((ref) => ref !== null);
  if (!activeRef) {
    return null;
  }
  return activeRef;
}

function show(p: { render: typeof innerNode }) {
  innerNode = p.render;

  getRef()?.show();
}

const DialogManager = {
  show,
  Holder: DialogHolderContainer,
};

export default DialogManager;
