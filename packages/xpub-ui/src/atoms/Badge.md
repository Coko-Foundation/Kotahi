A badge that displays a count and a label.

```js
<Badge count={5} label="created"/> 
```

A plural form of the label can be provided.

```js
<div>
    <Badge count={1} label="thing" plural="things"/> 
    <Badge count={99} label="thing" plural="things"/> 
    <Badge count={0} label="thing" plural="things"/> 
    <Badge count={299} label="thing" plural="things"/> 
</div>
```
